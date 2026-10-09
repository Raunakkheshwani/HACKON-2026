import { BudgetProvider } from './context/BudgetContext';
import AppShell from './components/AppShell';

function App() {
  return (
    <BudgetProvider>
      <AppShell />
    </BudgetProvider>
  );
}

export default App;
