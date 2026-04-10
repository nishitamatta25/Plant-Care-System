const fs = require('fs');
let html = fs.readFileSync('../index.html', 'utf8');

// Extract everything between <body> and the first <script> tag
let bodyMatch = html.match(/<body>([\s\S]*?)<script/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Convert HTML to JSX
bodyContent = bodyContent.replace(/class=/g, 'className=')
                         .replace(/for=/g, 'htmlFor=');

// Close unclosed tags
bodyContent = bodyContent.replace(/(<img[^>]*?[^\/])>/g, '$1 />')
                         .replace(/(<input[^>]*?[^\/])>/g, '$1 />')
                         .replace(/(<br[^>]*?[^\/])>/g, '$1 />');

// Convert style attributes
bodyContent = bodyContent.replace(/style="display: none;"/g, 'style={{ display: "none" }}');

// One comment in the original HTML uses <!-- --> which is valid in JSX children, 
// but wait, in JSX we need {/* */} for comments or we can just replace them.
bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// The original script tags at the bottom were excluded by our regex `[\s\S]*?<script`
// So bodyContent ends before the scripts.

const appJsx = `import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Dynamically load legacy scripts to preserve 100% functionality
    const loadScript = (src) => {
      return new Promise((resolve) => {
        // Only load if not already present
        if (document.querySelector(\`script[src="\${src}"]\`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };
    
    // Check if the script exists to avoid double attaching on HMR
    if (!window.legacyScriptsLoaded) {
      const loadDeps = async () => {
        await loadScript('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js');
        await loadScript('/script.js');
        await loadScript('/auth.js');
        window.legacyScriptsLoaded = true;
      };
      loadDeps();
    }
  }, []);

  return (
    <>
      ${bodyContent}
    </>
  );
}

export default App;`;

fs.writeFileSync('src/App.jsx', appJsx);
console.log('Successfully written src/App.jsx');
