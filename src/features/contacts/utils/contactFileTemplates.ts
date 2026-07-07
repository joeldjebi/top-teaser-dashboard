const headers = [
  'nom et prénoms',
  'numéro mobile',
  'adresse email',
  'commune',
  'pays',
]

export function downloadContactsCsvTemplate() {
  const content = [headers]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n')

  downloadFile({
    content,
    filename: 'modele-contacts.csv',
    type: 'text/csv;charset=utf-8',
  })
}

export function downloadContactsExcelTemplate() {
  const tableRows = [headers]
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
    )
    .join('')
  const content = `<!doctype html><html><head><meta charset="utf-8"></head><body><table>${tableRows}</table></body></html>`

  downloadFile({
    content,
    filename: 'modele-contacts.xls',
    type: 'application/vnd.ms-excel;charset=utf-8',
  })
}

export function downloadContactsTestCsvFile() {
  const content = [headers, ...buildTestContactRows()]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n')

  downloadFile({
    content,
    filename: 'top-teaser-test-50-contacts.csv',
    type: 'text/csv;charset=utf-8',
  })
}

function buildTestContactRows() {
  const names = [
    'Awa Koné',
    'Jean Kouassi',
    'Fatou Diabaté',
    'Mamadou Traoré',
    'Nadia Bamba',
    'Serge Nguessan',
    'Kadiatou Coulibaly',
    'Armand Yao',
    'Mireille Aké',
    'Souleymane Cissé',
  ]
  const communes = [
    'Cocody',
    'Marcory',
    'Yopougon',
    'Abobo',
    'Plateau',
    'Treichville',
    'Bingerville',
    'Port-Bouët',
    'Koumassi',
    'Adjamé',
  ]

  return Array.from({ length: 50 }, (_, index) => {
    const number = index + 1
    const padded = String(number).padStart(3, '0')

    return [
      `${names[index % names.length]} ${padded}`,
      `+225070030${String(number).padStart(4, '0')}`,
      `contact.demo${padded}@top-teaser.test`,
      communes[index % communes.length],
      'Côte d’Ivoire',
    ]
  })
}

function downloadFile(input: {
  content: string
  filename: string
  type: string
}) {
  const blob = new Blob([input.content], { type: input.type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = input.filename
  link.click()
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
