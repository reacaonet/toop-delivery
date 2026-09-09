import { Router } from 'express';
import { env } from '../config';

const router = Router();

router.post(`/${env.LTS ?? 'v1'}/token`, (_req, res) =>
  res.status(501).json({
    success: false,
    error:
      'Autenticação de app ainda não implementada — provisione INTEGRATION_APP_TOKEN/INTEGRATION_APP_SECRET e implemente a emissão de token (Fase 4)',
  })
);

// Conectores ERP/estoque (stubs com degradação clara até haver credenciais/contrato)
router.get('/integrations/connectors', (_req, res) =>
  res.status(400).json({
    success: false,
    error:
      'Conectores ERP ainda não contratados (Fase 4): informe as credenciais do provedor e o contrato da API de integração',
  })
);

export default router;