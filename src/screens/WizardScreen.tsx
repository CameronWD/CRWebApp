import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ThoughtRecord } from '../lib/types';
import type { WizardMode } from '../lib/wizard';
import { getRecord, newRecord } from '../lib/repository';
import Wizard from './Wizard';

export default function WizardScreen({ mode }: { mode: WizardMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ThoughtRecord | null>(null);

  useEffect(() => {
    if (mode === 'new') {
      setRecord(newRecord());
      return;
    }
    const n = Number(id);
    if (!Number.isInteger(n)) {
      navigate('/');
      return;
    }
    void getRecord(n)
      .then((r) => {
        if (r) setRecord(r);
        else navigate('/');
      })
      .catch(() => navigate('/'));
  }, [mode, id, navigate]);

  if (!record) return null;
  return <Wizard initialRecord={record} mode={mode} />;
}
