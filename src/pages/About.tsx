const PRESCRIBER_CATEGORIES = [
  { code: 'A*', description: 'Consultant/Specialists for specific indications only' },
  { code: 'A', description: 'Consultant/Specialists' },
  { code: 'A/KK', description: 'Consultant/Specialists/Family physician specialists' },
  { code: 'B', description: 'Consultant/Specialists/Family physician specialists/Medical officers' },
  {
    code: 'C',
    description: 'Consultant/Specialists/Family physician specialists/Medical officers/Paramedics',
  },
  {
    code: 'C+',
    description:
      'Consultant/Specialists/Family physician specialists/Medical officers/Paramedics/Paramedics doing midwifery',
  },
]

export function About() {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl md:p-8">
      <h1 className="text-2xl font-extrabold text-primary">About</h1>
      <p className="text-sm text-foreground">
        This is a drug formulary for pharmacists practicing in Malaysia.
      </p>

      <div className="rounded-lg border border-border bg-accent/40 p-4">
        <h2 className="mb-1 text-sm font-semibold">Important Disclaimer</h2>
        <p className="text-sm text-muted-foreground">
          Always consult prescribing information and clinical guidelines for complete information when needed.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Prescriber Categories in Malaysia MOH Settings</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          The category of prescribers who can initiate prescriptions are as follows:
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {PRESCRIBER_CATEGORIES.map((cat) => (
                <tr key={cat.code}>
                  <td className="w-24 px-4 py-2 font-semibold text-primary align-top">{cat.code}</td>
                  <td className="px-4 py-2 text-foreground">{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          * In the field of dentistry, Dental Senior Consultants/Consultants/Specialists and Dental Officers are
          included in the prescriber category as mentioned above; however, this applies only to medicines used in
          dental treatment.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Feedback: For feedback or suggestions on this drug database, please get in touch through the project's
        repository.
      </p>
    </div>
  )
}
