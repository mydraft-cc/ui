import * as React from 'react';

export const UserReport = React.memo(() => {
    React.useEffect(() => {
        window['_urq'] = window['_urq'] || [];
        window['_urq'].push(['initSite', 'b64f8170-a1e3-46fa-8c63-34514d064c15']);

        setTimeout(() => {
            const script = document.createElement('script');
            script.async = true;
            script.type = 'text/javascript';
            script.src = 'https://cdn.userreport.com/userreport.js';

            document.body.appendChild(script);
        }, 1000);
    });

    return null;
});