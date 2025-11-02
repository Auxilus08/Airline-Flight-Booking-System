import userRoutes from './src/routes/user.routes.js';
console.log('User routes loaded successfully:', typeof userRoutes);
console.log('Stack:', userRoutes.stack?.map(l => ({ path: l.route?.path, methods: Object.keys(l.route?.methods || {}) })));
