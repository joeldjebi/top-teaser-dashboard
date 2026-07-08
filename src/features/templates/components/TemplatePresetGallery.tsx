import { WandSparkles } from 'lucide-react'
import type { TemplatePreset } from '../data/templatePresets'

type TemplatePresetGalleryProps = {
  onUsePreset: (preset: TemplatePreset) => void
  presets: TemplatePreset[]
}

export function TemplatePresetGallery({
  onUsePreset,
  presets,
}: TemplatePresetGalleryProps) {
  return (
    <section className="preset-gallery">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Modèles prêts</p>
          <h2>Templates légers</h2>
        </div>
      </div>

      <div className="preset-grid">
        {presets.map((preset) => (
          <article className="preset-card" key={preset.id}>
            <div className="preset-preview" aria-hidden="true">
              <div />
              <span />
              <span />
              <strong />
            </div>
            <div>
              <span className="preset-category">{preset.category}</span>
              <h3>{preset.name}</h3>
              <p>{preset.description}</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => onUsePreset(preset)}
              type="button"
            >
              <WandSparkles size={17} />
              Utiliser
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
