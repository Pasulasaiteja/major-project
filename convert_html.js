const fs = require('fs');
const path = require('path');

const dir = "C:\\Users\\pasul\\Downloads\\major project\\stitch_screens\\stitch_major_project";
const outDir = "C:\\Users\\pasul\\Downloads\\major project\\frontend\\src\\pages";

const pages = [
    { in: 'client_portal_bank_details_mpin_login', out: 'ClientLogin.tsx', next: "home" },
    { in: 'client_portal_main_banking_home_card_protection', out: 'ClientHome.tsx', next: "hold" },
    { in: 'client_hold_explanation_investigation_ticket_request', out: 'ClientHold.tsx', next: "resolution" },
    { in: 'client_portal_account_card_freeze_resolution', out: 'ClientResolution.tsx', next: "home" },
    { in: 'bank_employee_support_verification_queue', out: 'ManagerDashboard.tsx', next: "home" }
];

pages.forEach(p => {
    const htmlPath = path.join(dir, p.in, 'code.html');
    if (fs.existsSync(htmlPath)) {
        const fullHtml = fs.readFileSync(htmlPath, 'utf8');
        // Extract main
        const mainMatch = fullHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/);
        if (mainMatch) {
            let htmlStr = mainMatch[0];
            
            // Clean out inline scripts and onclick
            htmlStr = htmlStr.replace(/<script[\s\S]*?<\/script>/g, '');
            htmlStr = htmlStr.replace(/onclick="[^"]*"/g, '');
            htmlStr = htmlStr.replace(/href="#"/g, 'href="#!"');
            
            // Generate React component wrapper
            const compName = p.out.replace('.tsx', '');
            const jsCode = `
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ${compName}() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      // Wait for DOM to update with HTML
      setTimeout(() => {
        // Attach navigation to any anchor with text or specific buttons
        const btns = document.querySelectorAll('button, a[href="#!"]');
        btns.forEach(b => {
           b.addEventListener('click', (e) => {
               e.preventDefault();
               navigate('/${p.next}');
           });
        });
      }, 50);
    }, 800);
    return () => clearTimeout(t);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface animate-pulse">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
       className="bg-surface min-h-screen font-body-md text-on-surface antialiased" 
       dangerouslySetInnerHTML={{ __html: \`${htmlStr.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\` }} 
    />
  );
}
`;

            fs.writeFileSync(path.join(outDir, p.out), jsCode);
            console.log("Written", p.out);
        }
    }
});
