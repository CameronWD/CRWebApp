import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ThoughtRecord } from '../lib/types';
import type { WizardMode } from '../lib/wizard';
import { getRecord, getSetting, newRecord } from '../lib/repository';
import Wizard from './Wizard';

export default function WizardScreen({ mode }: { mode: WizardMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ThoughtRecord | null>(null);
  const [namePatterns, setNamePatterns] = useState<boolean | null>(null);

  useEffect(() => {
    void getSetting('namePatterns').then((v) => setNamePatterns(v === '1'));
  }, []);

  useEffect(() => {
    if (mode === 'new') {
      setRecord(newRecord('classic'));
      return;
    }
    const n = Number(id);
    if (!Number.isInteger(n)) {
      navigate('/', { replace: true });
      return;
    }
    void getRecord(n)
      .then((r) => {
        if (r) setRecord(r);
        else navigate('/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, [mode, id, navigate]);

  if (!record || namePatterns === null) return null;
  return <Wizard initialRecord={record} mode={mode} includeDistortions={namePatterns} />;
}
