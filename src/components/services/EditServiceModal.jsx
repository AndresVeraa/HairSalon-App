import ServiceForm from './ServiceForm'

export default function EditServiceModal({ service, onSubmit, onCancel }) {
  if (!service) return null
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-10 bg-slate-900/30 p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-xl">
          <ServiceForm initialService={service} onSubmit={onSubmit} onCancel={onCancel} />
        </div>
      </div>
    </div>
  )
}
