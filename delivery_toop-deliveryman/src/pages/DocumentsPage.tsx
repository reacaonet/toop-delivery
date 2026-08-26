import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Image as ImageIcon, Upload, CheckCircle, XCircle, Clock, Save } from 'lucide-react'
import api, { deliverymanService } from '../api'
import { useAuth } from '../contexts/AuthContext'

type DocStatus = 'pending' | 'approved' | 'rejected'

interface Documents {
  cnh: string
  vehicleDocument: string
  photo: string
}

interface DocumentStatus {
  cnh: DocStatus
  vehicleDocument: DocStatus
  photo: DocStatus
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const [documents, setDocuments] = useState<Documents>({ cnh: '', vehicleDocument: '', photo: '' })
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>({
    cnh: 'pending', vehicleDocument: 'pending', photo: 'pending',
  })

  const [dirty, setDirty] = useState(false)

  const cnhInputRef = useRef<HTMLInputElement>(null)
  const vehicleDocInputRef = useRef<HTMLInputElement>(null)
  const photoDocInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await deliverymanService.getProfile()
      setDocuments({
        cnh: data.documents?.cnh || '',
        vehicleDocument: data.documents?.vehicleDocument || '',
        photo: data.documents?.photo || '',
      })
      setDocumentStatus({
        cnh: data.documentStatus?.cnh || 'pending',
        vehicleDocument: data.documentStatus?.vehicleDocument || 'pending',
        photo: data.documentStatus?.photo || 'pending',
      })
    } catch (e) {
      console.error('Erro ao carregar perfil:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docField: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField(docField)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.post('/upload/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.url
      if (url) {
        setDocuments((prev) => ({ ...prev, [docField]: url }))
        setDirty(true)
      }
    } catch (err: any) {
      alert('Erro ao enviar documento: ' + (err.response?.data?.error || err.message))
    } finally {
      setUploadingField(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await deliverymanService.updateDocuments(documents)
      refreshUser()
      setDirty(false)
      alert('Documentos enviados com sucesso! Aguarde a aprovacao do administrador.')
      loadProfile()
    } catch (err: any) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: DocStatus) => {
    switch (status) {
      case 'approved':
        return <span className="doc-status-badge approved"><CheckCircle size={14} /> Aprovado</span>
      case 'rejected':
        return <span className="doc-status-badge rejected"><XCircle size={14} /> Rejeitado</span>
      default:
        return <span className="doc-status-badge pending"><Clock size={14} /> Pendente</span>
    }
  }

  const renderUploadSection = (
    label: string,
    icon: React.ReactNode,
    docField: keyof Documents,
    inputRef: React.RefObject<HTMLInputElement | null>,
    accept: string = 'image/*,.pdf'
  ) => (
    <div className="doc-upload-section">
      <div className="doc-upload-header">
        <div className="doc-upload-icon">{icon}</div>
        <div className="doc-upload-info">
          <span className="doc-upload-label">{label}</span>
          {getStatusBadge(documentStatus[docField])}
        </div>
      </div>

      {documents[docField] ? (
        <div className="doc-preview">
          <a href={documents[docField]} target="_blank" rel="noopener noreferrer" className="doc-preview-link-lg">
            Visualizar documento enviado
          </a>
        </div>
      ) : (
        <div className="doc-preview doc-preview-empty">
          <span>Nenhum arquivo enviado</span>
        </div>
      )}

      <input
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={(e) => handleUpload(e, docField)}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="doc-upload-btn-lg"
        onClick={() => inputRef.current?.click()}
        disabled={uploadingField === docField}
      >
        <Upload size={16} />
        {uploadingField === docField ? 'Enviando...' : documents[docField] ? 'Trocar arquivo' : 'Selecionar arquivo'}
      </button>
    </div>
  )

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>
  }

  return (
    <div className="documents-page">
      <div className="earnings-header">
        <button className="btn-back" onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Documentos</h1>
      </div>

      <div className="documents-info-banner">
        <p>Envie seus documentos para validacao. O administrador ira analisar e aprovar ou rejeitar cada documento.</p>
      </div>

      {renderUploadSection(
        'CNH (Carteira Nacional de Habilitacao)',
        <FileText size={24} />,
        'cnh',
        cnhInputRef,
        'image/*,.pdf'
      )}

      {renderUploadSection(
        'Documento do Veiculo (CRLV)',
        <FileText size={24} />,
        'vehicleDocument',
        vehicleDocInputRef,
        'image/*,.pdf'
      )}

      {renderUploadSection(
        'Foto do Entregador (Selfie)',
        <ImageIcon size={24} />,
        'photo',
        photoDocInputRef,
        'image/*'
      )}

      <button
        type="button"
        className="btn btn-primary btn-full"
        onClick={handleSave}
        disabled={saving || !dirty}
      >
        {saving ? <div className="spinner-sm" /> : <><Save size={16} /> Salvar Documentos</>}
      </button>
    </div>
  )
}

export default DocumentsPage
