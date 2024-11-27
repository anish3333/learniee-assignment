import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MutatingDots } from "react-loader-spinner";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return(
      <div className="flex h-screen w-screen justify-center items-center">
      <MutatingDots
        visible={true}
        height="100"
        width="100"
        color="#4f46e5"
        secondaryColor="#4f46e5"
        radius="12.5"
        ariaLabel="mutating-dots-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
      
    </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
