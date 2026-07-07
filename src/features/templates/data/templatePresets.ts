import type { TemplateFormValues } from '../types/templateTypes'

export type TemplatePreset = TemplateFormValues & {
  id: string
  category: string
  description: string
}

export const templatePresets: TemplatePreset[] = [
  {
    id: 'welcome-premium',
    category: 'Bienvenue',
    name: 'Bienvenue premium',
    subject: 'Bienvenue {{fullName}}, heureux de vous compter parmi nous',
    description: 'Un email élégant pour accueillir un nouveau contact.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f8;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe8ec;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:34px 34px 24px;background:#0f766e;color:#ffffff;">
                <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.86;">Top Teaser</div>
                <h1 style="margin:12px 0 0;font-size:30px;line-height:1.15;">Bienvenue {{fullName}}</h1>
                <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:#dff7f4;">Votre inscription est confirmée. Nous sommes ravis de vous accompagner depuis {{commune}}, {{country}}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Bonjour {{fullName}},</p>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#475569;">Vous recevrez ici nos meilleures informations, offres et actualités. Chaque message sera pensé pour être clair, utile et facile à lire.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                  <tr>
                    <td style="padding:18px;">
                      <strong style="display:block;color:#0f172a;font-size:15px;">Vos informations</strong>
                      <span style="display:block;margin-top:8px;color:#64748b;font-size:14px;line-height:1.6;">Email : {{email}}<br>Commune : {{commune}}<br>Pays : {{country}}</span>
                    </td>
                  </tr>
                </table>
                <a href="https://example.com" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:700;">Découvrir maintenant</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 34px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;">Vous recevez cet email car vous êtes inscrit à notre audience. <a href="{{unsubscribeUrl}}" style="color:#0f766e;">Se désabonner</a></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    textContent:
      'Bienvenue {{fullName}}. Votre inscription est confirmée depuis {{commune}}, {{country}}. Email : {{email}}. Se désabonner : {{unsubscribeUrl}}',
  },
  {
    id: 'exclusive-offer',
    category: 'Promotion',
    name: 'Offre exclusive',
    subject: '{{fullName}}, une offre spéciale vous attend',
    description: 'Un template commercial premium pour annoncer une offre limitée.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f6f3ee;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e7ded0;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #efe6d8;">
                <span style="display:inline-block;background:#111827;color:#ffffff;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;text-transform:uppercase;">Offre limitée</span>
                <h1 style="margin:18px 0 10px;font-size:32px;line-height:1.1;color:#111827;">Une sélection premium pour vous, {{fullName}}</h1>
                <p style="margin:0;color:#64748b;font-size:16px;line-height:1.65;">Disponible pour nos contacts à {{commune}}. Profitez d’une proposition claire, soignée et valable pendant une courte période.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111827;border-radius:8px;color:#ffffff;">
                  <tr>
                    <td style="padding:24px;">
                      <div style="font-size:13px;color:#cbd5e1;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Avantage client</div>
                      <div style="margin-top:10px;font-size:42px;line-height:1;font-weight:800;">-25%</div>
                      <p style="margin:12px 0 0;color:#e2e8f0;font-size:15px;line-height:1.6;">Sur votre prochaine commande ou réservation avec votre adresse {{email}}.</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 20px;color:#475569;font-size:16px;line-height:1.7;">Cette offre a été préparée pour vous permettre de passer à l’action rapidement, avec une expérience fluide et professionnelle.</p>
                <a href="https://example.com/offre" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;border-radius:8px;padding:14px 20px;font-weight:800;">Profiter de l’offre</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#faf7f2;color:#78716c;font-size:12px;line-height:1.6;">Offre soumise à conditions. <a href="{{unsubscribeUrl}}" style="color:#92400e;">Se désabonner</a></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    textContent:
      '{{fullName}}, une offre spéciale vous attend : -25% sur votre prochaine commande ou réservation. Commune : {{commune}}. Se désabonner : {{unsubscribeUrl}}',
  },
  {
    id: 'event-invitation',
    category: 'Événement',
    name: 'Invitation événement',
    subject: 'Invitation privée pour {{fullName}}',
    description: 'Un email d’invitation élégant pour lancement, atelier ou rendez-vous.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;background:#eef6f5;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef6f5;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #d7e8e5;">
            <tr>
              <td style="padding:36px 32px;text-align:center;">
                <div style="color:#0f766e;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;">Invitation privée</div>
                <h1 style="margin:14px 0 12px;font-size:30px;line-height:1.16;">{{fullName}}, rejoignez-nous pour une expérience exclusive</h1>
                <p style="margin:0 auto;max-width:500px;color:#64748b;font-size:16px;line-height:1.7;">Nous préparons un moment privilégié pour notre communauté à {{commune}}.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;">
                  <tr>
                    <td style="padding:18px;border-bottom:1px solid #e2e8f0;">
                      <strong style="display:block;font-size:14px;color:#64748b;">Date</strong>
                      <span style="display:block;margin-top:4px;font-size:18px;font-weight:800;color:#0f172a;">Jeudi 24 juillet</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px;">
                      <strong style="display:block;font-size:14px;color:#64748b;">Lieu</strong>
                      <span style="display:block;margin-top:4px;font-size:18px;font-weight:800;color:#0f172a;">{{commune}}, {{country}}</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0;color:#475569;font-size:16px;line-height:1.7;">Votre place est réservée avec l’adresse {{email}}. Confirmez votre présence pour recevoir les détails pratiques.</p>
                <div style="text-align:center;">
                  <a href="https://example.com/invitation" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;padding:14px 20px;font-weight:800;">Confirmer ma présence</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;text-align:center;"><a href="{{unsubscribeUrl}}" style="color:#0f766e;">Se désabonner</a></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    textContent:
      'Invitation privée pour {{fullName}}. Date : jeudi 24 juillet. Lieu : {{commune}}, {{country}}. Confirmez votre présence : https://example.com/invitation',
  },
  {
    id: 'newsletter-editorial',
    category: 'Newsletter',
    name: 'Newsletter éditoriale',
    subject: 'Les nouveautés de la semaine, {{fullName}}',
    description: 'Un format clair pour partager actualités, conseils et liens utiles.',
    htmlContent: `<!doctype html>
<html>
  <body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f5f7fb;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #dfe7ef;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:#172033;color:#ffffff;">
                <div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#9dd7ce;">Newsletter</div>
                <h1 style="margin:12px 0 0;font-size:30px;line-height:1.15;">Bonjour {{fullName}}, voici l’essentiel de la semaine</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 22px;color:#475569;font-size:16px;line-height:1.7;">Nous avons sélectionné les informations les plus utiles pour vous aider à rester à jour et passer à l’action plus vite.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:18px 0;border-top:1px solid #e2e8f0;">
                      <strong style="display:block;font-size:18px;color:#0f172a;">1. Une nouveauté à ne pas manquer</strong>
                      <p style="margin:8px 0 0;color:#64748b;line-height:1.65;">Présentez ici votre annonce principale avec un bénéfice clair.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 0;border-top:1px solid #e2e8f0;">
                      <strong style="display:block;font-size:18px;color:#0f172a;">2. Conseil pratique</strong>
                      <p style="margin:8px 0 0;color:#64748b;line-height:1.65;">Ajoutez une astuce courte, utile et directement applicable.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
                      <strong style="display:block;font-size:18px;color:#0f172a;">3. À suivre</strong>
                      <p style="margin:8px 0 0;color:#64748b;line-height:1.65;">Annoncez le prochain rendez-vous ou la prochaine campagne.</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:22px 0 20px;color:#475569;font-size:15px;line-height:1.7;">Vous recevez cette sélection à {{commune}}, {{country}}.</p>
                <a href="https://example.com/newsletter" style="display:inline-block;background:#172033;color:#ffffff;text-decoration:none;border-radius:8px;padding:13px 18px;font-weight:800;">Lire la suite</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.6;">Envoyé à {{email}}. <a href="{{unsubscribeUrl}}" style="color:#0f766e;">Se désabonner</a></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    textContent:
      'Bonjour {{fullName}}, voici l’essentiel de la semaine : nouveauté, conseil pratique et prochain rendez-vous. Envoyé à {{email}}. Se désabonner : {{unsubscribeUrl}}',
  },
]
