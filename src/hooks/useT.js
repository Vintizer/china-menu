import useLangStore from '../store/langStore.js'
import { t } from '../i18n.js'

export default function useT() {
  const lang = useLangStore(s => s.lang)
  return t[lang]
}
