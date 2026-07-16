/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef1f7',
          100: '#d5dcea',
          200: '#abbad5',
          300: '#7b95bc',
          400: '#4d71a3',
          500: '#2a5089',
          600: '#1a3a6e',
          700: '#112d58',
          800: '#0f2343',  // PRIMARY
          900: '#091830',
        },
        gold: {
          50:  '#fdf8ef',
          100: '#f8edda',
          200: '#f0d9b0',
          300: '#e6c07f',
          400: '#d8a355',
          500: '#b98545',  // ACCENT
          600: '#9b6d35',
          700: '#7d5628',
          800: '#63431f',
          900: '#50341a',
        },
        cream: {
          50: '#f8f8f6',   // BACKGROUND
          100: '#f0f0ec',
          200: '#e5e5df',
          300: '#d4d4cb',
          400: '#bdbdb2',
          500: '#a0a093',
          600: '#828276',
          700: '#6a6a5f',
          800: '#565650',
          900: '#464640',
        },
        charcoal: {
          50:  '#f7f7f6',
          100: '#ededeb',
          200: '#e5e7eb',  // BORDER
          300: '#c4c0b9',
          400: '#a8a298',
          500: '#6b7280',  // SECONDARY TEXT
          600: '#706a60',
          700: '#2d2d2d',  // PRIMARY TEXT
          800: '#2d2d2d',
          900: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide':  '0.2em',
        'ultra-tight': '-0.03em',
      },
    },
  },
  plugins: [],
};
