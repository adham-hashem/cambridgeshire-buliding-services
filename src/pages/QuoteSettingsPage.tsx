import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Sliders,
  ListTodo,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BudgetOption {
  id: string;
  label: string;
  display_order: number;
  active: boolean;
}

interface QuoteFormSettings {
  id?: string;
  show_email: boolean;
  require_email: boolean;
  show_budget: boolean;
  require_budget: boolean;
  show_message: boolean;
  require_message: boolean;
  show_attachments: boolean;
  require_attachments: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
  category: string | null;
  published: boolean;
  show_in_quote: boolean;
}

export function QuoteSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fields' | 'services' | 'budgets'>('fields');
  
  // States
  const [settings, setSettings] = useState<QuoteFormSettings>({
    show_email: true,
    require_email: false,
    show_budget: true,
    require_budget: true,
    show_message: true,
    require_message: false,
    show_attachments: true,
    require_attachments: false,
  });
  const [budgetOptions, setBudgetOptions] = useState<BudgetOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [addingBudget, setAddingBudget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSettings(),
        loadBudgetOptions(),
        loadServices()
      ]);
    } catch (error) {
      console.error('Error loading quote settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_form_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data);
      } else {
        // Create default settings if not exists
        const { data: newRow } = await supabase
          .from('quote_form_settings')
          .insert({})
          .select()
          .single();
        if (newRow) setSettings(newRow);
      }
    } catch (e) {
      console.warn('Could not load quote form settings (migration might not be applied yet):', e);
    }
  };

  const loadBudgetOptions = async () => {
    try {
      const { data } = await supabase
        .from('budget_options')
        .select('*')
        .order('display_order');
      setBudgetOptions(data as BudgetOption[] || []);
    } catch (error) {
      console.error('Failed to load budget options:', error);
    }
  };

  const loadServices = async () => {
    try {
      const { data } = await supabase
        .from('services')
        .select('id, name, category, published, show_in_quote')
        .order('name');
      setServices((data as any[] || []).map(s => ({
        ...s,
        show_in_quote: s.show_in_quote ?? true // Default to true if column is missing
      })));
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Field toggles handler
  const updateSettingField = async (field: keyof QuoteFormSettings, value: boolean) => {
    const updatedSettings = { ...settings, [field]: value };
    
    // Automatic field interaction rules
    if (field.startsWith('show_') && !value) {
      const requireField = field.replace('show_', 'require_') as keyof QuoteFormSettings;
      (updatedSettings as any)[requireField] = false;
    }
    if (field.startsWith('require_') && value) {
      const showField = field.replace('require_', 'show_') as keyof QuoteFormSettings;
      (updatedSettings as any)[showField] = true;
    }

    setSettings(updatedSettings);

    try {
      if (settings.id) {
        const { error } = await supabase
          .from('quote_form_settings')
          .update(updatedSettings)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quote_form_settings')
          .insert(updatedSettings)
          .select()
          .single();
        if (error) throw error;
        if (data) setSettings(data);
      }
      showSuccess('Form fields configuration updated');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showSuccess('Failed to save settings. Check migrations.');
      loadSettings();
    }
  };

  // Service toggle handler
  const toggleServiceQuote = async (id: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ show_in_quote: !currentVal })
        .eq('id', id);

      if (error) throw error;

      setServices(prev =>
        prev.map(s => s.id === id ? { ...s, show_in_quote: !currentVal } : s)
      );
      showSuccess('Service dropdown options updated');
    } catch (error) {
      console.error('Failed to update service quote status:', error);
      showSuccess('Failed to update service. Check migrations.');
    }
  };

  // Budget options handlers
  const addBudgetOption = async () => {
    if (!newLabel.trim()) return;
    setSaving(true);
    try {
      const maxOrder = budgetOptions.reduce((max, o) => Math.max(max, o.display_order), 0);
      const { error } = await supabase.from('budget_options').insert({
        label: newLabel.trim(),
        display_order: maxOrder + 1,
        active: true,
      });
      if (error) throw error;
      setNewLabel('');
      setAddingBudget(false);
      loadBudgetOptions();
      showSuccess('Budget option added');
    } catch (error) {
      console.error('Failed to add budget option:', error);
      showSuccess('Error adding budget option.');
    } finally {
      setSaving(false);
    }
  };

  const toggleBudgetActive = async (id: string, currentActive: boolean) => {
    try {
      await supabase.from('budget_options').update({ active: !currentActive }).eq('id', id);
      setBudgetOptions((prev) =>
        prev.map((o) => (o.id === id ? { ...o, active: !currentActive } : o))
      );
      showSuccess(!currentActive ? 'Budget tier enabled' : 'Budget tier disabled');
    } catch (error) {
      console.error('Failed to toggle budget option:', error);
    }
  };

  const deleteBudgetOption = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget option?')) return;
    try {
      await supabase.from('budget_options').delete().eq('id', id);
      setBudgetOptions((prev) => prev.filter((o) => o.id !== id));
      showSuccess('Budget option deleted');
    } catch (error) {
      console.error('Failed to delete budget option:', error);
    }
  };

  const moveBudgetOption = async (index: number, direction: 'up' | 'down') => {
    const newOptions = [...budgetOptions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOptions.length) return;

    const tempOrder = newOptions[index].display_order;
    newOptions[index].display_order = newOptions[swapIndex].display_order;
    newOptions[swapIndex].display_order = tempOrder;

    [newOptions[index], newOptions[swapIndex]] = [newOptions[swapIndex], newOptions[index]];
    setBudgetOptions(newOptions);

    try {
      await Promise.all([
        supabase.from('budget_options').update({ display_order: newOptions[index].display_order }).eq('id', newOptions[index].id),
        supabase.from('budget_options').update({ display_order: newOptions[swapIndex].display_order }).eq('id', newOptions[swapIndex].id),
      ]);
    } catch (error) {
      console.error('Failed to reorder budgets:', error);
      loadBudgetOptions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="animate-fade-in flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/quotes')}
          className="p-2.5 hover:bg-cream-100 rounded-xl text-charcoal-500 hover:text-navy-800 transition-all border border-charcoal-200 bg-white"
          title="Back to Quote Requests"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-1">
            Quote Form Settings
          </h1>
          <p className="text-[#6b7280]">Customize fields, budgets, and services shown on the public quote form</p>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in text-sm font-medium">
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-charcoal-200 gap-2">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'fields'
              ? 'border-[#b98545] text-navy-800'
              : 'border-transparent text-[#6b7280] hover:text-navy-800'
          }`}
        >
          <Sliders size={16} /> Form Fields
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'services'
              ? 'border-[#b98545] text-navy-800'
              : 'border-transparent text-[#6b7280] hover:text-navy-800'
          }`}
        >
          <ListTodo size={16} /> Services Dropdown
        </button>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'budgets'
              ? 'border-[#b98545] text-navy-800'
              : 'border-transparent text-[#6b7280] hover:text-navy-800'
          }`}
        >
          <DollarSign size={16} /> Budget Options
        </button>
      </div>

      {/* TAB CONTENTS */}
      
      {/* 1. Fields Config */}
      {activeTab === 'fields' && (
        <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up bg-white rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy-800 mb-1">Determine Form Fields</h2>
            <p className="text-sm text-[#6b7280]">Toggle which contact information and project details are visible or required on the customer form.</p>
          </div>

          <div className="divide-y divide-charcoal-200 border-t border-b border-charcoal-100">
            {/* Email Field Settings */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-navy-800 text-base">Email Address</p>
                <p className="text-xs text-[#6b7280]">Collect email addresses for quotes and updates.</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Visible</span>
                  <button onClick={() => updateSettingField('show_email', !settings.show_email)} className="text-[#b98545]">
                    {settings.show_email ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Required</span>
                  <button 
                    disabled={!settings.show_email}
                    onClick={() => updateSettingField('require_email', !settings.require_email)} 
                    className={`text-[#b98545] ${!settings.show_email ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {settings.require_email ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
              </div>
            </div>

            {/* Budget Fields Settings */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-navy-800 text-base">Budget Selection</p>
                <p className="text-xs text-[#6b7280]">Allow customers to select their estimated budget range.</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Visible</span>
                  <button onClick={() => updateSettingField('show_budget', !settings.show_budget)} className="text-[#b98545]">
                    {settings.show_budget ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Required</span>
                  <button 
                    disabled={!settings.show_budget}
                    onClick={() => updateSettingField('require_budget', !settings.require_budget)} 
                    className={`text-[#b98545] ${!settings.show_budget ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {settings.require_budget ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
              </div>
            </div>

            {/* Message/Description Field Settings */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-navy-800 text-base">Project Description</p>
                <p className="text-xs text-[#6b7280]">Let users input custom notes or describe their requirements.</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Visible</span>
                  <button onClick={() => updateSettingField('show_message', !settings.show_message)} className="text-[#b98545]">
                    {settings.show_message ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Required</span>
                  <button 
                    disabled={!settings.show_message}
                    onClick={() => updateSettingField('require_message', !settings.require_message)} 
                    className={`text-[#b98545] ${!settings.show_message ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {settings.require_message ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
              </div>
            </div>

            {/* File Upload Settings */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-navy-800 text-base">Photos & Attachments</p>
                <p className="text-xs text-[#6b7280]">Let users upload images or documents related to their site.</p>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Visible</span>
                  <button onClick={() => updateSettingField('show_attachments', !settings.show_attachments)} className="text-[#b98545]">
                    {settings.show_attachments ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-charcoal-600">Required</span>
                  <button 
                    disabled={!settings.show_attachments}
                    onClick={() => updateSettingField('require_attachments', !settings.require_attachments)} 
                    className={`text-[#b98545] ${!settings.show_attachments ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {settings.require_attachments ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-[#9ca3af]" />}
                  </button>
                </label>
              </div>
            </div>
          </div>
          <div className="bg-[#fcf8f2] border border-[#f5e6d3] p-4 rounded-xl text-xs text-[#b98545] font-medium leading-relaxed">
            Note: Name and Phone Number are always required to ensure you can reach out to the customer.
          </div>
        </div>
      )}

      {/* 2. Services Configuration */}
      {activeTab === 'services' && (
        <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up bg-white rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-navy-800 mb-1">Services in Quote Form</h2>
            <p className="text-sm text-[#6b7280]">Choose which services appear as options in the dropdown selection. (Unpublished services are always hidden).</p>
          </div>

          <div className="border border-charcoal-200 rounded-xl overflow-hidden divide-y divide-charcoal-100">
            {services.length === 0 ? (
              <div className="p-8 text-center text-[#6b7280]">No services found. Add services in the Services section.</div>
            ) : (
              services.map(svc => (
                <div key={svc.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-cream-50 transition-colors">
                  <div>
                    <p className={`font-semibold text-sm ${svc.published ? 'text-[#1f2937]' : 'text-charcoal-400'}`}>
                      {svc.name}
                      {!svc.published && (
                        <span className="ml-2 text-[9px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                          Draft
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{svc.category || 'No Category'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-charcoal-500 font-medium">Show in Dropdown</span>
                    <button 
                      onClick={() => toggleServiceQuote(svc.id, svc.show_in_quote)} 
                      className="text-[#b98545]"
                    >
                      {svc.show_in_quote ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-[#9ca3af]" />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. Budget Options Configuration */}
      {activeTab === 'budgets' && (
        <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up rounded-2xl bg-white">
          <div className="px-6 py-5 border-b border-charcoal-200 bg-cream-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1f2937] flex items-center gap-2">
                Budget Tiers
              </h2>
              <p className="text-[#6b7280] text-sm mt-1">Manage the selectable budget levels. Reorder, toggle, or add new levels.</p>
            </div>
            <button
              onClick={() => setAddingBudget(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Add Tier
            </button>
          </div>

          <div className="divide-y divide-charcoal-200">
            {/* Add new option row */}
            {addingBudget && (
              <div className="px-6 py-4 bg-navy-50/30 flex items-center gap-3 animate-fade-in">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. £500 – £1,000"
                  className="input-premium flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addBudgetOption();
                    if (e.key === 'Escape') { setAddingBudget(false); setNewLabel(''); }
                  }}
                />
                <button
                  onClick={addBudgetOption}
                  disabled={saving || !newLabel.trim()}
                  className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
                >
                  <Check size={16} /> Add
                </button>
                <button
                  onClick={() => { setAddingBudget(false); setNewLabel(''); }}
                  className="p-2 text-[#6b7280] hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {budgetOptions.length === 0 ? (
              <div className="px-6 py-12 text-center text-[#6b7280]">
                No budget options configured. Add one to get started.
              </div>
            ) : (
              budgetOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`px-6 py-4 flex items-center gap-4 transition-all duration-200 hover:bg-cream-50 ${
                    !option.active ? 'opacity-50' : ''
                  }`}
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveBudgetOption(index, 'up')}
                      disabled={index === 0}
                      className="text-[#9ca3af] hover:text-[#1f2937] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
                      title="Move up"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button
                      onClick={() => moveBudgetOption(index, 'down')}
                      disabled={index === budgetOptions.length - 1}
                      className="text-[#9ca3af] hover:text-[#1f2937] disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-0.5"
                      title="Move down"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                  </div>

                  <GripVertical size={16} className="text-[#d1d5db] flex-shrink-0" />

                  <span className={`flex-1 font-medium text-sm ${option.active ? 'text-[#1f2937]' : 'text-[#9ca3af] line-through'}`}>
                    {option.label}
                  </span>

                  <span className="text-[10px] text-[#9ca3af] uppercase tracking-widest font-medium">
                    #{index + 1}
                  </span>

                  <span className={`text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full ${
                    option.active
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-500 border border-red-200'
                  }`}>
                    {option.active ? 'Active' : 'Hidden'}
                  </span>

                  <button
                    onClick={() => toggleBudgetActive(option.id, option.active)}
                    className={`transition-colors ${option.active ? 'text-green-500 hover:text-green-600' : 'text-[#9ca3af] hover:text-green-500'}`}
                    title={option.active ? 'Disable this option' : 'Enable this option'}
                  >
                    {option.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>

                  <button
                    onClick={() => deleteBudgetOption(option.id)}
                    className="text-[#9ca3af] hover:text-red-500 transition-colors p-1"
                    title="Delete option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
