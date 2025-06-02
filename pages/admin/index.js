// File: ./pages/admin/index.js

-import { supabase } from '../../lib/supabaseClient'
-import AdminLayout from '../../components/admin/AdminLayout'
+import { supabase } from '../../lib/supabaseClient'
+import AdminLayout from '../../components/admin/AdminLayout'

 export default function AdminHomePage() {
   const [totais, setTotais] = useState({
     users: 0,
     transactions: 0,
     pendingTransactions: 0,
     rendimentos: 0,
   })
   // … resto do código …
   if (loading) {
     return (
-      <AdminLayout>
+      <AdminLayout>
         <p style={{ textAlign: 'center', marginTop: '2rem' }}>
           Carregando painel…
         </p>
-      </AdminLayout>
+      </AdminLayout>
     )
   }
   if (error) {
     return (
-      <AdminLayout>
+      <AdminLayout>
         <p
           style={{
             textAlign: 'center',
             marginTop: '2rem',
             color: 'red',
           }}
         >
           {error}
         </p>
-      </AdminLayout>
+      </AdminLayout>
     )
   }

   return (
-    <AdminLayout>
+    <AdminLayout>
       <div
         style={{
           maxWidth: '1000px',
           margin: 'auto',
           padding: '2rem 1rem',
         }}
       >
         <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
           Admin Dashboard
         </h1>
         <div
           style={{
             display: 'flex',
             flexWrap: 'wrap',
             gap: '1.5rem',
             justifyContent: 'center',
           }}
         >
           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Usuários</h2>
             <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
               {totais.users}
             </p>
             <Link href="/admin/users">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>

           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Transações</h2>
             <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
               {totais.transactions}
             </p>
             <p>Pendentes: {totais.pendingTransactions}</p>
             <Link href="/admin/transactions">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>

           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Rendimentos</h2>
             <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>
               {totais.rendimentos}
             </p>
             <Link href="/admin/rendimentos_aplicados">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>

           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Planos</h2>
             <Link href="/admin/plans">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>

           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Configurações</h2>
             <Link href="/admin/configs">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>

           <div
             style={{
               background: '#fff',
               border: '1px solid #ddd',
               borderRadius: '8px',
               padding: '1.5rem',
               width: '220px',
               textAlign: 'center',
               boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
             }}
           >
             <h2>Páginas</h2>
             <Link href="/admin/page_contents">
               <a
                 style={{
                   display: 'inline-block',
                   marginTop: '1rem',
                   padding: '0.5rem 1rem',
                   background: '#0070f3',
                   color: '#fff',
                   borderRadius: '6px',
                   textDecoration: 'none',
                 }}
               >
                 Gerenciar
               </a>
             </Link>
           </div>
         </div>
       </div>
-  </AdminLayout>
+  </AdminLayout>
 )
}
