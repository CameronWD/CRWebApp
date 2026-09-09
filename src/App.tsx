import { HashRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import WizardScreen from './screens/WizardScreen';
import RecordListScreen from './screens/RecordListScreen';
import RecordDetailScreen from './screens/RecordDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto w-full max-w-md px-5">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/new" element={<WizardScreen mode="new" />} />
            <Route path="/complete/:id" element={<WizardScreen mode="complete" />} />
            <Route path="/edit/:id" element={<WizardScreen mode="edit" />} />
            <Route path="/records" element={<RecordListScreen />} />
            <Route path="/record/:id" element={<RecordDetailScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </HashRouter>
  );
}
