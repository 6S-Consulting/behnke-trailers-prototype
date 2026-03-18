import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Shield, Store, Truck } from 'lucide-react';

const roles: { role: UserRole; title: string; subtitle: string; icon: React.ElementType; name: string }[] = [
  { role: 'admin', title: 'Admin', subtitle: 'Behnke Enterprises Internal', icon: Shield, name: 'Operations Manager' },
  { role: 'dealer', title: 'Dealer', subtitle: 'Midwest Trailer Sales', icon: Store, name: 'Mike Johnson' },
  { role: 'customer', title: 'Customer', subtitle: 'Hartmann Farms', icon: Truck, name: 'John Hartmann' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate(role === 'admin' ? '/admin' : role === 'dealer' ? '/dealer' : '/customer');
  };

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          <span className="text-sidebar-primary-foreground">B-B </span>
          <span className="text-primary">TRAILERS</span>
        </h1>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-sidebar-foreground mt-2 opacity-60">
          Behnke Enterprises, Inc. — Farley, Iowa
        </p>
        <p className="text-sidebar-foreground text-sm mt-4 opacity-80">
          Manufacturing Trailers of the Highest Quality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {roles.map(({ role, title, subtitle, icon: Icon, name }) => (
          <button
            key={role}
            onClick={() => handleLogin(role)}
            className="bg-sidebar-accent border border-sidebar-border rounded-lg p-6 text-left hover:border-primary transition-all duration-150 group"
          >
            <Icon size={28} className="text-primary mb-4" />
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-sidebar-accent-foreground">
              {title}
            </h2>
            <p className="text-xs text-sidebar-foreground mt-1">{subtitle}</p>
            <p className="text-[11px] text-sidebar-foreground mt-0.5 opacity-60">as {name}</p>
            <div className="mt-4 inline-flex items-center text-xs font-display uppercase tracking-wider text-primary group-hover:underline">
              Enter Dashboard →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Login;
