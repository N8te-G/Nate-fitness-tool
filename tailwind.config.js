// Tailwind settings for the app. After changing classes in index.html, rebuild the stylesheet:
//   npm install && npm run build:css
module.exports = {
    content: ['./index.html'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                slate: {
                    850: '#151e2e',
                    950: '#090d16'
                }
            }
        }
    }
};
