import { db } from './firebase'

console.log('🔍 === DIAGNÓSTICO FIREBASE ===')
console.log('Firebase DB objeto:', db)
console.log('Tipo:', typeof db)
console.log('Propiedades:', Object.keys(db))

// Verificar variables de entorno
console.log('\n📋 Variables de entorno (primeros 5 caracteres):')
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY?.slice(0, 5) + '...')
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.error('❌ ERROR: VITE_FIREBASE_API_KEY no está definida. Verifica tu archivo .env.local')
}

if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  console.error('❌ ERROR: VITE_FIREBASE_PROJECT_ID no está definida. Verifica tu archivo .env.local')
}

console.log('✅ === FIN DIAGNÓSTICO ===\n')
