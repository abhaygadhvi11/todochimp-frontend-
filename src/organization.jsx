// import { useState, useEffect } from 'react';

// const API_URL = 'http://localhost:3000';

// export default function SignupPage({ onSwitchToLogin }) {
//   const [signupType, setSignupType] = useState('create'); // 'create' or 'invite'
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     organizationName: '',
//     inviteToken: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [inviteInfo, setInviteInfo] = useState(null);

//   // Check for invite token in URL params on component mount
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const token = urlParams.get('invite');
//     if (token) {
//       setSignupType('invite');
//       setFormData(prev => ({ ...prev, inviteToken: token }));
//       validateInviteToken(token);
//     }
//   }, []);

//   const validateInviteToken = async (token) => {
//     try {
//       const response = await fetch(`${API_URL}/api/auth/validate-invite/${token}`);
//       const data = await response.json();
      
//       if (response.ok) {
//         setInviteInfo(data.data);
//         setFormData(prev => ({ 
//           ...prev, 
//           email: data.data.email || prev.email 
//         }));
//       } else {
//         setErrors({ inviteToken: data.error || 'Invalid invite link' });
//       }
//     } catch (error) {
//       console.error('Error validating invite token:', error);
//       setErrors({ inviteToken: 'Cannot validate invite link' });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleSignupTypeChange = (type) => {
//     setSignupType(type);
//     setErrors({});
//     setInviteInfo(null);
//     if (type === 'create') {
//       setFormData(prev => ({ ...prev, inviteToken: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }
    
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }
    
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     if (signupType === 'create' && !formData.organizationName.trim()) {
//       newErrors.organizationName = 'Organization name is required';
//     }

//     if (signupType === 'invite' && !formData.inviteToken.trim()) {
//       newErrors.inviteToken = 'Invite token is required';
//     }
    
//     return newErrors;
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     setErrors({});

//     // Validate form
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       setIsLoading(false);
//       return;
//     }

//     try {
//       if (signupType === 'create') {
//         // For creating organization: First register user, then create organization
//         console.log('Step 1: Creating user account...');
//         console.log('Request URL:', `${API_URL}/api/auth/register`);
//         console.log('Request payload:', {
//           name: formData.name,
//           email: formData.email,
//           password: '[HIDDEN]'
//         });
        
//         const userPayload = {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password
//         };
        
//         const userResponse = await fetch(`${API_URL}/api/auth/register`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(userPayload),
//         });

//         console.log('User registration response status:', userResponse.status);
        
//         let userData;
//         try {
//           userData = await userResponse.json();
//           console.log('User registration response:', userData);
//         } catch (parseError) {
//           console.error('Failed to parse user registration response:', parseError);
//           setErrors({ general: 'Invalid response from server during user registration' });
//           setIsLoading(false);
//           return;
//         }

//         if (!userResponse.ok) {
//           if (userData.errors) {
//             setErrors(userData.errors);
//           } else {
//             setErrors({ general: userData.error || userData.message || 'User registration failed' });
//           }
//           setIsLoading(false);
//           return;
//         }

//         console.log('Step 2: Creating organization...');
//         console.log('Organization request URL:', `${API_URL}/api/organization/index`);
//         console.log('Using token:', userData.data?.token ? 'Token present' : 'No token');
        
//         // Now create organization with the new user's token
//         const orgPayload = {
//           name: formData.organizationName
//         };
        
//         const orgResponse = await fetch(`${API_URL}/api/organization/index`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${userData.data.token}`
//           },
//           body: JSON.stringify(orgPayload),
//         });

//         console.log('Organization creation response status:', orgResponse.status);
        
//         if (orgResponse.status === 404) {
//           setErrors({ 
//             general: 'Organization endpoint not found. Please check if /api/organization/index.js exists in your backend.' 
//           });
//           setIsLoading(false);
//           return;
//         }
        
//         let orgData;
//         try {
//           orgData = await orgResponse.json();
//           console.log('Organization creation response:', orgData);
//         } catch (parseError) {
//           console.error('Failed to parse organization response:', parseError);
//           setErrors({ general: 'Invalid response from server during organization creation' });
//           setIsLoading(false);
//           return;
//         }

//         if (orgResponse.ok) {
//           alert(`Account and organization "${formData.organizationName}" created successfully! Welcome, ${userData.data.user.name}!`);
          
//           // Reset form
//           setFormData({
//             name: '',
//             email: '',
//             password: '',
//             confirmPassword: '',
//             organizationName: '',
//             inviteToken: ''
//           });
//         } else {
//           // Organization creation failed, but user was created
//           const errorMsg = orgData.error || orgData.message || `HTTP ${orgResponse.status}: Unknown error`;
//           setErrors({ 
//             general: `User account created, but organization creation failed: ${errorMsg}` 
//           });
//         }
//       } else {
//         // For invite signup: Use the invite endpoint
//         console.log('Connecting to:', `${API_URL}/api/auth/register-with-invite`);
        
//         const payload = {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           inviteToken: formData.inviteToken
//         };
        
//         const response = await fetch(`${API_URL}/api/auth/register-with-invite`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(payload),
//         });

//         const data = await response.json();

//         if (response.ok) {
//           const userData = data.data.user;
//           alert(`Account created successfully! Welcome to ${inviteInfo?.organizationName || 'the organization'}, ${userData.name}!`);
          
//           // Reset form
//           setFormData({
//             name: '',
//             email: '',
//             password: '',
//             confirmPassword: '',
//             organizationName: '',
//             inviteToken: ''
//           });
//           setInviteInfo(null);
//         } else {
//           // Handle validation errors from backend
//           if (data.errors) {
//             setErrors(data.errors);
//           } else {
//             setErrors({ general: data.error || data.message || 'Registration failed' });
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Network/Connection error:', error);
      
//       // More specific error messages based on error type
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         setErrors({ general: 'Cannot connect to server. Please check if backend is running on http://localhost:3000' });
//       } else if (error.name === 'AbortError') {
//         setErrors({ general: 'Request timed out. Please try again.' });
//       } else {
//         setErrors({ general: `Connection error: ${error.message}` });
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInviteTokenSubmit = async () => {
//     if (!formData.inviteToken.trim()) {
//       setErrors({ inviteToken: 'Please enter an invite token' });
//       return;
//     }
    
//     setErrors({});
//     await validateInviteToken(formData.inviteToken);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       {/* Background decoration */}
//       <div className="absolute w-40 h-40 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
//       <div className="absolute w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>

//       {/* Signup Card */}
//       <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
        
//         {/* Header */}
//         <div className="text-center mb-6">
//           <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
//           <p className="text-gray-600">Sign up for a new account</p>
//         </div>

//         {/* Signup Type Toggle */}
//         <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
//           <button
//             onClick={() => handleSignupTypeChange('create')}
//             className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
//               signupType === 'create'
//                 ? 'bg-white text-blue-600 shadow-sm'
//                 : 'text-gray-600 hover:text-gray-800'
//             }`}
//           >
//             Create Organization
//           </button>
//           <button
//             onClick={() => handleSignupTypeChange('invite')}
//             className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
//               signupType === 'invite'
//                 ? 'bg-white text-blue-600 shadow-sm'
//                 : 'text-gray-600 hover:text-gray-800'
//             }`}
//           >
//             Join with Invite
//           </button>
//         </div>

//         {/* Invite Info Display */}
//         {inviteInfo && (
//           <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
//             <p className="text-sm">
//               <strong>Joining:</strong> {inviteInfo.organizationName}
//               <br />
//               <strong>Invited by:</strong> {inviteInfo.adminName}
//             </p>
//           </div>
//         )}

//         {/* Error Message */}
//         {errors.general && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//             {errors.general}
//           </div>
//         )}

//         {/* Form */}
//         <div className="space-y-6">
//           {/* Invite Token Field (only for invite signup) */}
//           {signupType === 'invite' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Invite Token
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   name="inviteToken"
//                   type="text"
//                   required
//                   value={formData.inviteToken}
//                   onChange={handleChange}
//                   className={`flex-1 px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                     errors.inviteToken ? 'border-red-300' : 'border-gray-200'
//                   }`}
//                   placeholder="Enter invite token"
//                 />
//                 <button
//                   onClick={handleInviteTokenSubmit}
//                   className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
//                 >
//                   Verify
//                 </button>
//               </div>
//               {errors.inviteToken && (
//                 <p className="text-sm text-red-600 mt-1">{errors.inviteToken}</p>
//               )}
//             </div>
//           )}

//           {/* Organization Name Field (only for create organization) */}
//           {signupType === 'create' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Organization Name
//               </label>
//               <input
//                 name="organizationName"
//                 type="text"
//                 required
//                 value={formData.organizationName}
//                 onChange={handleChange}
//                 className={`w-full px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                   errors.organizationName ? 'border-red-300' : 'border-gray-200'
//                 }`}
//                 placeholder="Enter organization name"
//               />
//               {errors.organizationName && (
//                 <p className="text-sm text-red-600 mt-1">{errors.organizationName}</p>
//               )}
//             </div>
//           )}

//           {/* Name Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Full Name
//             </label>
//             <input
//               name="name"
//               type="text"
//               required
//               value={formData.name}
//               onChange={handleChange}
//               className={`w-full px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                 errors.name ? 'border-red-300' : 'border-gray-200'
//               }`}
//               placeholder="Enter your full name"
//             />
//             {errors.name && (
//               <p className="text-sm text-red-600 mt-1">{errors.name}</p>
//             )}
//           </div>

//           {/* Email Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               name="email"
//               type="email"
//               required
//               value={formData.email}
//               onChange={handleChange}
//               disabled={inviteInfo && inviteInfo.email}
//               className={`w-full px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                 errors.email ? 'border-red-300' : 'border-gray-200'
//               } ${inviteInfo && inviteInfo.email ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//               placeholder="Enter your email"
//             />
//             {errors.email && (
//               <p className="text-sm text-red-600 mt-1">{errors.email}</p>
//             )}
//             {inviteInfo && inviteInfo.email && (
//               <p className="text-sm text-gray-500 mt-1">Email pre-filled from invite</p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               name="password"
//               type="password"
//               required
//               value={formData.password}
//               onChange={handleChange}
//               className={`w-full px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                 errors.password ? 'border-red-300' : 'border-gray-200'
//               }`}
//               placeholder="Create a password (min 6 characters)"
//             />
//             {errors.password && (
//               <p className="text-sm text-red-600 mt-1">{errors.password}</p>
//             )}
//           </div>

//           {/* Confirm Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Confirm Password
//             </label>
//             <input
//               name="confirmPassword"
//               type="password"
//               required
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className={`w-full px-4 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                 errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
//               }`}
//               placeholder="Confirm your password"
//             />
//             {errors.confirmPassword && (
//               <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
//             )}
//           </div>

//           {/* Role Information */}
//           <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
//             <p className="text-sm text-blue-700">
//               <strong>Your role:</strong> {signupType === 'create' ? 'ADMIN (Organization Owner)' : 'USER (Team Member)'}
//             </p>
//           </div>

//           {/* Submit Button */}
//           <button
//             onClick={handleSubmit}
//             disabled={isLoading || (signupType === 'invite' && !inviteInfo)}
//             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed shadow-lg"
//           >
//             {isLoading 
//               ? 'Creating Account...' 
//               : signupType === 'create' 
//                 ? 'Create Organization & Account' 
//                 : 'Join Organization'
//             }
//           </button>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-6 pt-4 border-t border-gray-200">
//           <p className="text-sm text-gray-600">
//             Already have an account?{' '}
//             <button 
//               onClick={onSwitchToLogin}
//               className="text-blue-600 hover:text-blue-700 font-medium"
//             >
//               Sign in here
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }