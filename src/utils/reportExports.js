const escapeCsvValue = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

const formatCurrency = (value) => Math.round(Number.parseFloat(value || 0)).toLocaleString('es-CO')
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  )

export const buildReportRows = (services) =>
  services.map((service) => ({
    Fecha: new Date(service.date).toLocaleString('es-CO'),
    Cliente: service.client,
    Servicio: service.type,
    Personal: service.staff,
    'Método de pago': service.paymentMethod,
    'Precio original': formatCurrency(service.originalPrice ?? service.price),
    Descuento: service.discountPercentage ? `${service.discountPercentage}%` : '0%',
    'Total cobrado': formatCurrency(service.price),
    Notas: service.notes || '',
  }))

const getFileName = (extension, startDate, endDate) => `reporte-hair-style-${startDate}-${endDate}.${extension}`

const downloadBlob = (content, type, fileName) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export const downloadCsvReport = (services, startDate, endDate) => {
  const rows = buildReportRows(services)
  const headers = Object.keys(
    rows[0] || {
      Fecha: '',
      Cliente: '',
      Servicio: '',
      Personal: '',
      'Método de pago': '',
      'Precio original': '',
      Descuento: '',
      'Total cobrado': '',
      Notas: '',
    },
  )
  const csv = [headers, ...rows.map((row) => headers.map((header) => row[header]))]
    .map((row) => row.map(escapeCsvValue).join(';'))
    .join('\r\n')
  downloadBlob(`\ufeff${csv}`, 'text/csv;charset=utf-8', getFileName('csv', startDate, endDate))
}

export const downloadExcelReport = (services, startDate, endDate) => {
  const rows = buildReportRows(services)
  const headers = Object.keys(
    rows[0] || {
      Fecha: '',
      Cliente: '',
      Servicio: '',
      Personal: '',
      'Método de pago': '',
      'Precio original': '',
      Descuento: '',
      'Total cobrado': '',
      Notas: '',
    },
  )
  const table = `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`
  downloadBlob(
    `<!doctype html><html><meta charset="utf-8"><body>${table}</body></html>`,
    'application/vnd.ms-excel;charset=utf-8',
    getFileName('xls', startDate, endDate),
  )
}

export const printPdfReport = (services, startDate, endDate, income) => {
  const rows = buildReportRows(services)
  const reportWindow = window.open('', '_blank')
  if (!reportWindow) throw new Error('El navegador bloqueó la ventana del reporte.')
  reportWindow.opener = null
  const tableRows = rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.Fecha)}</td><td>${escapeHtml(row.Cliente)}</td><td>${escapeHtml(row.Servicio)}</td><td>${escapeHtml(row.Personal)}</td><td>${escapeHtml(row['Total cobrado'])}</td></tr>`,
    )
    .join('')
  reportWindow.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte Hair Style</title><style>body{font-family:Arial,sans-serif;color:#121212;padding:32px}h1{margin-bottom:4px}p{color:#5a534a}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #d8d0c5;padding:8px;text-align:left}th{background:#f0e7da}@media print{button{display:none}}</style></head><body><h1>Hair Style — Reporte de servicios</h1><p>Periodo: ${startDate} a ${endDate} · Total: $${formatCurrency(income)}</p><table><thead><tr><th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Personal</th><th>Total cobrado</th></tr></thead><tbody>${tableRows}</tbody></table><button onclick="window.print()">Imprimir / Guardar como PDF</button></body></html>`,
  )
  reportWindow.document.close()
}
