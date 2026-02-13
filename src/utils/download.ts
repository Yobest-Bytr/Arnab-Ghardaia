import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const downloadProject = async (project: any, scripts: any[]) => {
  const zip = new JSZip();
  
  // Add project metadata
  zip.file('project-meta.json', JSON.stringify(project, null, 2));
  
  // Add scripts maintaining directory structure
  scripts.forEach(script => {
    const path = script.path || script.title;
    zip.file(path, script.content);
  });

  // Generate a basic package.json for local use
  const packageJson = {
    name: project.title.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "^0.263.1",
      "framer-motion": "^10.16.4",
      "clsx": "^2.0.0",
      "tailwind-merge": "^1.14.0"
    },
    devDependencies: {
      "vite": "^4.4.5",
      "@vitejs/plugin-react": "^4.0.3",
      "tailwindcss": "^3.3.3",
      "autoprefixer": "^10.4.14",
      "postcss": "^8.4.27"
    }
  };
  
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${project.title.replace(/\s+/g, '_')}_v1.zip`);
};