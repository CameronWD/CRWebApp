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
    void getRecord(Number(id)).then((r) => {
      if (r) setRecord(r);
      else navigate('/');
    });
  }, [mode, id, navigate]);

  if (!record) return null;
  return <Wizard initialRecord={record} mode={mode} />;
}
