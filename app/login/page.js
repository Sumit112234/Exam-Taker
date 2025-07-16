"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ModernLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { login } = useAuth();


  // Mouse tracking for background gradient effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value) ? '' : 'Please enter a valid email address';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      default:
        return '';
    }
  };

  const handleSubmitGoogle = async (credentialResponse) => {
    // setIsLoading(true);
    console.log("GoogleAuthButton rendered ");

      const tokenId = credentialResponse?.credential;
      console.log("Extracted Google Token ID:", tokenId);

      if (!tokenId) {
        console.error("No tokenId found in credentialResponse");
        return;
      }
    // try {
      // Simulate Google login
      let result = await login('')
  // }
}

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Real-time validation
    if (name !== 'rememberMe') {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);
    // console.log("loding")
    
    try {
      // Simulate API call
      let result = await login(formData.email, formData.password);
      // console.log("result", result)
      
      if(!result.success)
      {
        setErrors({ email: result.error || 'Login failed. Please try again.' });
        setIsLoading(false);
        return;
      }
      // Simulate success
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      setErrors({ email: 'Login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0.2, 0.8, 0.2]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }}
    />
  ));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
        }}
      />
      
      {/* Floating Particles */}
      {particles}

      {/* Main Form Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        {/* Glassmorphism Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 relative"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </motion.div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: formData.email ? 1.1 : 1,
                    color: errors.email ? '#ef4444' : formData.email ? '#10b981' : '#6b7280'
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <Mail className="w-5 h-5" />
                </motion.div>
                
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.email ? 'border-red-400 focus:border-red-500' : 
                    formData.email ? 'border-green-400 focus:border-green-500' : 
                    'border-gray-200 focus:border-purple-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  aria-label="Email address"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                
                {/* Validation Icons */}
                <AnimatePresence>
                  {formData.email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {errors.email ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Error Message */}
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    id="email-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: formData.password ? 1.1 : 1,
                    color: errors.password ? '#ef4444' : formData.password ? '#10b981' : '#6b7280'
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <Lock className="w-5 h-5" />
                </motion.div>
                
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    errors.password ? 'border-red-400 focus:border-red-500' : 
                    formData.password ? 'border-green-400 focus:border-green-500' : 
                    'border-gray-200 focus:border-purple-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                
                {/* Password Toggle */}
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, rotate: 180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, rotate: 180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              
              {/* Error Message */}
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    id="password-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <motion.input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-white border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  whileTap={{ scale: 0.9 }}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              
              <motion.a
                href="#"
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot password?
              </motion.a>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </motion.div>
                ) : isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Welcome back!
                  </motion.div>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Google OAuth Button */}
            <motion.button
              type="button"
              variants={buttonVariants}
              initial="idle"
               onSuccess={handleSubmitGoogle}
              whileHover="hover"
              whileTap="tap"
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </motion.button>
          </div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <motion.a
                href="#"
                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up
              </motion.a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ModernLoginForm;

// "use client";
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Eye, EyeOff, Lock, Mail, Shield, Sparkles, Star, AlertCircle, CheckCircle } from 'lucide-react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';

// const LoginPortal = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [focusedField, setFocusedField] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [particles, setParticles] = useState([]);
//   let router = useRouter();

//   const searchParams = useSearchParams()
//   const { login, user } = useAuth()
//     const redirectPath = searchParams.get("redirect") || "/dashboard"

//   useEffect(() => {
//     // If user is already logged in, redirect them

//     console.log("User:", user )
//     if (user) {
//       router.push(user.role === "admin" ? "/admin" : "/dashboard")
//     }
//   }, [user, router])


//   // Initialize floating particles
//   useEffect(() => {
//     const newParticles = [...Array(50)].map((_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 4 + 1,
//       duration: Math.random() * 3 + 2,
//       delay: Math.random() * 2,
//     }));
//     setParticles(newParticles);
//   }, []);

//   // Mouse tracking
//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({ 
//         x: (e.clientX / window.innerWidth) * 100,
//         y: (e.clientY / window.innerHeight) * 100
//       });
//     };
    
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
    
//     // Simulate API call
//         const result = await login(email, password)
//     // await new Promise(resolve => setTimeout(resolve, 2000));
    
//     if (!result.success) {
//       setError(result.error)
//     } else {
//       // Redirect to intended page or dashboard
//       router.push(redirectPath)
//     }
//   };

//   const handleGoogleSignIn = () => {
//     // Simulate Google sign-in
//     console.log('Google Sign-In clicked');
//   };

//   const containerVariants = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { 
//       opacity: 1, 
//       scale: 1,
//       transition: { 
//         duration: 0.6,
//         ease: "easeOut",
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { duration: 0.5 }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         {/* Gradient Orbs */}
//         <motion.div
//           className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
//           style={{
//             left: `${mousePosition.x}%`,
//             top: `${mousePosition.y}%`,
//           }}
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
        
//         <motion.div
//           className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
//           animate={{
//             x: [0, 100, 0],
//             y: [0, -50, 0],
//             scale: [1.2, 1, 1.2],
//           }}
//           transition={{
//             duration: 15,
//             repeat: Infinity,
//             ease: "easeInOut"
//           }}
//           style={{ right: '10%', top: '20%' }}
//         />

//         {/* Floating Particles */}
//         {particles.map((particle) => (
//           <motion.div
//             key={particle.id}
//             className="absolute rounded-full bg-gradient-to-r from-purple-400/40 to-pink-400/40"
//             style={{
//               left: `${particle.x}%`,
//               top: `${particle.y}%`,
//               width: `${particle.size}px`,
//               height: `${particle.size}px`,
//             }}
//             animate={{
//               y: [0, -100, 0],
//               opacity: [0, 1, 0],
//               scale: [0, 1, 0],
//             }}
//             transition={{
//               duration: particle.duration,
//               repeat: Infinity,
//               delay: particle.delay,
//               ease: "easeInOut"
//             }}
//           />
//         ))}
//       </div>

//       {/* Main Login Container */}
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="relative z-10 w-full max-w-md"
//       >
//         {/* Glassmorphism Card */}
//         <motion.div
//           className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden"
//           whileHover={{ scale: 1.02 }}
//           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         >
//           {/* Header */}
//           <motion.div 
//             variants={itemVariants}
//             className="text-center p-8 pb-6"
//           >
//             <motion.div
//               className="inline-flex items-center gap-3 mb-6"
//               whileHover={{ scale: 1.05 }}
//             >
//               <motion.div
//                 className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
//               >
//                 <Shield className="h-8 w-8 text-purple-300" />
//               </motion.div>
//               <h1 className="text-3xl font-bold text-white">
//                 SecurePortal
//               </h1>
//             </motion.div>
            
//             <motion.div
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/30 mb-4"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <Sparkles className="h-4 w-4 text-purple-300" />
//               <span className="text-sm text-purple-200 font-medium">Enterprise Access</span>
//             </motion.div>
            
//             <p className="text-slate-300 text-lg">
//               Welcome to your secure digital workspace
//             </p>
//           </motion.div>

//           {/* Form */}
//           <motion.div variants={itemVariants} className="px-8 pb-8">
//             <AnimatePresence>
//               {error && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                   className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 backdrop-blur-sm"
//                 >
//                   <div className="flex items-center gap-3">
//                     <AlertCircle className="h-5 w-5 text-red-300" />
//                     <p className="text-red-200 text-sm">{error}</p>
//                   </div>
//                 </motion.div>
//               )}
              
//               {success && (
//                 <motion.div
//                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                   className="mb-6 p-4 rounded-2xl bg-green-500/20 border border-green-400/30 backdrop-blur-sm"
//                 >
//                   <div className="flex items-center gap-3">
//                     <CheckCircle className="h-5 w-5 text-green-300" />
//                     <p className="text-green-200 text-sm">Login successful! Welcome back.</p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div className="space-y-6">
//               {/* Email Field */}
//               <motion.div
//                 variants={itemVariants}
//                 className="relative"
//               >
//                 <label className="block text-white font-medium mb-3 text-sm">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <motion.div
//                     className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
//                     animate={{ 
//                       scale: focusedField === 'email' ? 1.1 : 1,
//                       color: focusedField === 'email' ? '#a855f7' : '#94a3b8'
//                     }}
//                   >
//                     <Mail className="h-5 w-5" />
//                   </motion.div>
                  
//                   <motion.input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     onFocus={() => setFocusedField('email')}
//                     onBlur={() => setFocusedField(null)}
//                     placeholder="Enter your email"
//                     className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-300"
//                     whileFocus={{ scale: 1.02 }}
//                     required
//                   />
                  
//                   {focusedField === 'email' && (
//                     <motion.div
//                       className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layoutId="inputGlow"
//                     />
//                   )}
//                 </div>
//               </motion.div>

//               {/* Password Field */}
//               <motion.div
//                 variants={itemVariants}
//                 className="relative"
//               >
//                 <label className="block text-white font-medium mb-3 text-sm">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <motion.div
//                     className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
//                     animate={{ 
//                       scale: focusedField === 'password' ? 1.1 : 1,
//                       color: focusedField === 'password' ? '#a855f7' : '#94a3b8'
//                     }}
//                   >
//                     <Lock className="h-5 w-5" />
//                   </motion.div>
                  
//                   <motion.input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     onFocus={() => setFocusedField('password')}
//                     onBlur={() => setFocusedField(null)}
//                     placeholder="Enter your password"
//                     className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-300"
//                     whileFocus={{ scale: 1.02 }}
//                     required
//                   />
                  
//                   <motion.button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-300 transition-colors z-10"
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                   </motion.button>
                  
//                   {focusedField === 'password' && (
//                     <motion.div
//                       className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       layoutId="inputGlow"
//                     />
//                   )}
//                 </div>
//               </motion.div>

//               {/* Remember & Forgot */}
//               <motion.div
//                 variants={itemVariants}
//                 className="flex items-center justify-between text-sm"
//               >
//                 <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
//                   <input type="checkbox" className="rounded border-slate-600 bg-slate-700" />
//                   Remember me
//                 </label>
//                 <motion.a
//                   href="#"
//                   className="text-purple-300 hover:text-purple-200 transition-colors"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Forgot password?
//                 </motion.a>
//               </motion.div>

//               {/* Login Button */}
//               <motion.button
//                 type="submit"
//                 disabled={isLoading}
//                 onClick={handleSubmit}
//                 className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//                 variants={itemVariants}
//               >
//                 {isLoading ? (
//                   <motion.div 
//                     className="flex items-center justify-center gap-3"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     <motion.div
//                       className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                     />
//                     Authenticating...
//                   </motion.div>
//                 ) : (
//                   <span className="flex items-center justify-center gap-2">
//                     <Shield className="h-5 w-5" />
//                     Sign In Securely
//                   </span>
//                 )}
//               </motion.button>

//               {/* Divider */}
//               <motion.div
//                 variants={itemVariants}
//                 className="relative flex items-center justify-center py-4"
//               >
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-slate-600"></div>
//                 </div>
//                 <div className="relative bg-slate-800/50 px-4 text-sm text-slate-400 backdrop-blur-sm rounded-full">
//                   or continue with
//                 </div>
//               </motion.div>

//               {/* Google Sign-In */}
//               <motion.button
//                 type="button"
//                 onClick={handleGoogleSignIn}
//                 className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
//                 whileHover={{ scale: 1.02, y: -2 }}
//                 whileTap={{ scale: 0.98 }}
//                 variants={itemVariants}
//               >
//                 <div className="flex items-center justify-center gap-3">
//                   <svg className="w-5 h-5" viewBox="0 0 24 24">
//                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                   </svg>
//                   Continue with Google
//                 </div>
//               </motion.button>
//                           </div>

//             {/* Demo Credentials */}
//             <motion.div
//               variants={itemVariants}
//               className="mt-8 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm"
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <Star className="h-4 w-4 text-blue-300" />
//                 <span className="text-blue-300 font-medium text-sm">Demo Access</span>
//               </div>
//               <p className="text-blue-200 text-xs">
//                 Email: demo@example.com<br />
//                 Password: demo123
//               </p>
//             </motion.div>

//             {/* Sign Up Link */}
//             <motion.p
//               variants={itemVariants}
//               className="text-center text-slate-300 mt-6"
//             >
//               Don't have an account?{' '}
//               <motion.a
//                 href="#"
//                 className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 Create one now
//               </motion.a>
//             </motion.p>
//           </motion.div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginPortal;


// "use client"

// import { useState, useEffect, Suspense } from "react"
// import Link from "next/link"
// import { useRouter, useSearchParams } from "next/navigation"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { BookOpen, AlertCircle, Eye, EyeOff, Sparkles, Star, ArrowLeft, Shield, Zap } from "lucide-react"
// import { useAuth } from "@/contexts/AuthContext"

// function LoginForm() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { login, user } = useAuth()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [focusedField, setFocusedField] = useState(null)

//   const redirectPath = searchParams.get("redirect") || "/dashboard"

//   useEffect(() => {
//     // If user is already logged in, redirect them
//     if (user) {
//       router.push(user.role === "admin" ? "/admin" : "/dashboard")
//     }
//   }, [user, router])

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     setIsLoading(true)

//     const result = await login(email, password)

//     if (!result.success) {
//       setError(result.error)
//     } else {
//       // Redirect to intended page or dashboard
//       router.push(redirectPath)
//     }

//     setIsLoading(false)
//   }

//   const fillDemoCredentials = (type) => {
//     if (type === 'student') {
//       setEmail('user@example.com')
//       setPassword('password123')
//     } else {
//       setEmail('admin@example.com')
//       setPassword('admin123')
//     }
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9, y: 20 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="w-full max-w-md"
//     >
//       <Card className="relative overflow-hidden border-2 border-purple-400/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl shadow-purple-500/20">
//         {/* Animated background elements - more visible */}
//         <div className="absolute inset-0 opacity-40">
//           <motion.div
//             className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
//             animate={{
//               scale: [1, 1.2, 1],
//               rotate: [0, 180, 360],
//             }}
//             transition={{
//               duration: 10,
//               repeat: Infinity,
//               ease: "linear"
//             }}
//           />
//           <motion.div
//             className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl"
//             animate={{
//               scale: [1.2, 1, 1.2],
//               rotate: [360, 180, 0],
//             }}
//             transition={{
//               duration: 12,
//               repeat: Infinity,
//               ease: "linear"
//             }}
//           />
//         </div>

//         <CardHeader className="relative text-center pb-6">
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mb-4"
//           >
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 border border-purple-400/40 shadow-lg">
//               <Shield className="h-4 w-4 text-white" />
//               <span className="text-sm text-white font-medium">Secure Login</span>
//             </div>
//           </motion.div>
          
//           <CardTitle className="text-4xl font-bold text-white mb-2">
//             <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
//               Welcome Back
//             </span>
//           </CardTitle>
//           <CardDescription className="text-slate-300 text-base">
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="relative space-y-6">
//           <AnimatePresence>
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <Alert variant="destructive" className="border-2 border-red-400/70 bg-red-900/80 backdrop-blur-sm shadow-lg">
//                   <AlertCircle className="h-5 w-5 text-red-300" />
//                   <AlertDescription className="text-red-100 font-medium">{error}</AlertDescription>
//                 </Alert>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 }}
//               className="space-y-3"
//             >
//               <Label htmlFor="email" className="text-white font-semibold text-base">
//                 Email Address
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="name@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   onFocus={() => setFocusedField('email')}
//                   onBlur={() => setFocusedField(null)}
//                   required
//                   autoComplete="email"
//                   className="bg-slate-700/90 border-2 border-slate-500/50 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 h-12 text-base"
//                 />
//                 {focusedField === 'email' && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
//                   />
//                 )}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="space-y-3"
//             >
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password" className="text-white font-semibold text-base">
//                   Password
//                 </Label>
//                 <Link 
//                   href="/forgot-password" 
//                   className="text-sm text-purple-300 hover:text-purple-200 hover:underline transition-colors font-medium"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   onFocus={() => setFocusedField('password')}
//                   onBlur={() => setFocusedField(null)}
//                   required
//                   autoComplete="current-password"
//                   className="bg-slate-700/90 border-2 border-slate-500/50 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 pr-14 transition-all duration-300 h-12 text-base"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-md"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </Button>
//                 {focusedField === 'password' && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
//                   />
//                 )}
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//             >
//               <Button 
//                 type="submit" 
//                 className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-base shadow-xl hover:shadow-purple-500/30 transition-all duration-300 border-0 h-12" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <motion.div 
//                     className="flex items-center gap-2"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     <motion.div
//                       className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                     />
//                     Signing in...
//                   </motion.div>
//                 ) : (
//                   <span className="flex items-center gap-2">
//                     <Zap className="h-5 w-5" />
//                     Sign In
//                   </span>
//                 )}
//               </Button>
//             </motion.div>
//           </form>
//         </CardContent>

//         <CardFooter className="relative flex justify-center pt-6">
//           <motion.p 
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//             className="text-base text-slate-300"
//           >
//             Don&apos;t have an account?{" "}
//             <Link href="/signup" className="text-purple-300 hover:text-white font-semibold hover:underline transition-colors">
//               Sign up
//             </Link>
//           </motion.p>
//         </CardFooter>
//       </Card>

//       {/* Demo Accounts - Enhanced visibility */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.7 }}
//         className="mt-8 text-center"
//       >
//         <p className="text-base text-slate-300 mb-6 flex items-center justify-center gap-3 font-medium">
//           <Star className="h-5 w-5 text-yellow-400" />
//           Quick Demo Access
//           <Star className="h-5 w-5 text-yellow-400" />
//         </p>
//         <div className="flex gap-6 justify-center">
//           <motion.div
//             whileHover={{ scale: 1.05, y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => fillDemoCredentials('student')}
//             className="cursor-pointer bg-slate-800/90 border-2 border-blue-400/50 p-6 rounded-xl backdrop-blur-sm hover:border-blue-400/80 hover:bg-slate-700/90 transition-all duration-300 shadow-lg hover:shadow-blue-500/20 min-w-[140px]"
//           >
//             <p className="font-bold text-blue-300 mb-3 text-lg">Student Demo</p>
//             <p className="text-sm text-blue-200 mb-1 font-medium">user@example.com</p>
//             <p className="text-sm text-blue-200 mb-3 font-medium">password123</p>
//             <div className="text-xs text-blue-400 font-semibold bg-blue-900/30 px-3 py-1 rounded-full">Click to fill</div>
//           </motion.div>
          
//           <motion.div
//             whileHover={{ scale: 1.05, y: -2 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => fillDemoCredentials('admin')}
//             className="cursor-pointer bg-slate-800/90 border-2 border-purple-400/50 p-6 rounded-xl backdrop-blur-sm hover:border-purple-400/80 hover:bg-slate-700/90 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 min-w-[140px]"
//           >
//             <p className="font-bold text-purple-300 mb-3 text-lg">Admin Demo</p>
//             <p className="text-sm text-purple-200 mb-1 font-medium">admin@example.com</p>
//             <p className="text-sm text-purple-200 mb-3 font-medium">admin123</p>
//             <div className="text-xs text-purple-400 font-semibold bg-purple-900/30 px-3 py-1 rounded-full">Click to fill</div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   )
// }

// export default function Login() {
//   const [mounted, setMounted] = useState(false)
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

//   useEffect(() => {
//     setMounted(true)
    
//     const handleMouseMove = (e) => {
//       setMousePosition({ x: e.clientX, y: e.clientY })
//     }
    
//     window.addEventListener('mousemove', handleMouseMove)
//     return () => window.removeEventListener('mousemove', handleMouseMove)
//   }, [])

//   if (!mounted) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         <motion.div
//           className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//         />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
//       {/* Animated Background - Reduced opacity for better visibility */}
//       <div className="absolute inset-0">
//         {/* Gradient Orbs */}
//         <motion.div
//           className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
//           animate={{
//             scale: [1, 1.2, 1],
//             rotate: [0, 180, 360],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
//         <motion.div
//           className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
//           animate={{
//             scale: [1.2, 1, 1.2],
//             rotate: [360, 180, 0],
//           }}
//           transition={{
//             duration: 15,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
        
//         {/* Floating Particles - Reduced quantity and opacity */}
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
//             style={{
//               left: `${Math.random() * 100}%`,
//               top: `${Math.random() * 100}%`,
//             }}
//             animate={{
//               y: [0, -100, 0],
//               opacity: [0, 0.8, 0],
//             }}
//             transition={{
//               duration: 3 + Math.random() * 2,
//               repeat: Infinity,
//               delay: Math.random() * 2,
//             }}
//           />
//         ))}
//       </div>

//       {/* Mouse Follower - More visible */}
//       <motion.div
//         className="fixed pointer-events-none z-50 w-8 h-8 border-2 border-purple-400/60 rounded-full shadow-lg shadow-purple-400/20"
//         animate={{
//           x: mousePosition.x - 16,
//           y: mousePosition.y - 16,
//         }}
//         transition={{
//           type: "spring",
//           stiffness: 500,
//           damping: 28,
//         }}
//       />

//       <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
//         {/* Header - Enhanced visibility */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-12"
//         >
//           <Link href="/" className="flex items-center gap-4 group">
//             <motion.div
//               whileHover={{ rotate: 15, scale: 1.1 }}
//               transition={{ type: "spring", stiffness: 400, damping: 17 }}
//               className="p-2 rounded-full bg-slate-800/50 border border-purple-400/30"
//             >
//               <ArrowLeft className="h-6 w-6 text-purple-300 group-hover:text-white transition-colors" />
//             </motion.div>
            
//             <div className="flex items-center gap-4">
//               <motion.div
//                 whileHover={{ rotate: 360 }}
//                 transition={{ duration: 0.6 }}
//                 className="relative"
//               >
//                 <BookOpen className="h-10 w-10 text-purple-400" />
//                 <motion.div
//                   className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg"
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 />
//               </motion.div>
              
//               <h1 className="text-4xl font-bold text-white">
//                 <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
//                   ExamPro
//                 </span>
//               </h1>
//             </div>
//           </Link>
//         </motion.div>

//         {/* Login Form */}
//         <Suspense
//           fallback={
//             <motion.div
//               className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//             />
//           }
//         >
//           <LoginForm />
//         </Suspense>
//       </div>
//     </div>
//   )
// }