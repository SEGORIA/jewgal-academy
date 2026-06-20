# 🔧 Guía de configuración — Jewgal Academy

Stack decidido con el cliente:

| Servicio | Uso | Plan inicial |
|---|---|---|
| **Stripe** | Pagos con tarjeta / Apple Pay | Gratis (2.9% + $0.30 por venta) |
| **PayPal** | Pago alternativo | Gratis (comisión por venta) |
| **Vercel** | Hosting del sitio | Gratis → Pro $20/mes si crece |
| **Supabase** | Base de datos PostgreSQL | Gratis hasta 500MB |
| **Cloudinary** | PDFs y documentos del aula | Gratis hasta 25GB |
| **Vimeo** | Grabaciones de clases (privadas) | Plus ~$12/mes |
| **Dominio** | jewgalacademy.com | ~$12/año (Namecheap/GoDaddy) |

> ⚠️ **Las cuentas las crea el cliente con su propio email** para que queden a su nombre y bajo su control. Yo configuro el código con los datos que me pases.

---

## 1️⃣ Stripe — https://stripe.com
1. Crear cuenta → activar el negocio (datos de la Fundación + cuenta bancaria para recibir el dinero).
2. Ir a **Developers → API keys**.
3. Pasarme:
   - `STRIPE_SECRET_KEY` (empieza con `sk_live_...` o `sk_test_...`)
   - `STRIPE_PUBLISHABLE_KEY` (empieza con `pk_...`)
4. El **webhook** lo configuro yo y te confirmo el `STRIPE_WEBHOOK_SECRET`.

## 2️⃣ PayPal — https://developer.paypal.com
1. Crear cuenta de negocio.
2. En **Apps & Credentials** crear una app.
3. Pasarme:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`

## 3️⃣ Supabase — https://supabase.com
1. Crear proyecto (elegir región **East US** por Miami).
2. Guardar la contraseña de la base de datos.
3. En **Project Settings → Database** pasarme:
   - `DATABASE_URL` (connection string, modo "Transaction"/pooler)

## 4️⃣ Cloudinary — https://cloudinary.com
1. Crear cuenta gratuita.
2. En el **Dashboard** pasarme:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 5️⃣ Vimeo — https://vimeo.com
1. Crear cuenta **Plus** (permite videos privados con dominio restringido).
2. En **Developer → My Apps** generar un token.
3. Pasarme:
   - `VIMEO_ACCESS_TOKEN`

## 6️⃣ Dominio — Namecheap / GoDaddy / Cloudflare
1. Comprar **jewgalacademy.com**.
2. Avisarme dónde lo compraste → te paso los registros DNS para apuntarlo a Vercel.

## 7️⃣ Vercel — https://vercel.com
1. Crear cuenta (puede ser con GitHub).
2. Cuando el código esté en GitHub, lo conecto y hago el deploy.
3. (Opcional) crear cuenta de **GitHub** para versionar el código.

## 8️⃣ Email transaccional — Resend — https://resend.com
Para enviar el email de bienvenida con la contraseña al alumno tras pagar.
1. Crear cuenta y verificar el dominio jewgalacademy.com.
2. Pasarme:
   - `RESEND_API_KEY`

---

## 📋 Resumen de lo que necesito de vos

**Contenido / assets:**
- [ ] Fotos reales de Devora (alta resolución, vertical)
- [ ] Logo de Jewgal Academy
- [ ] Precios definitivos de cada programa
- [ ] Descripciones largas + temario de cada curso
- [ ] Testimonios reales (nombre + foto opcional)
- [ ] Textos de privacidad y términos

**Credenciales (a medida que vayas creando las cuentas):**
- [ ] Stripe: secret + publishable key
- [ ] PayPal: client id + secret
- [ ] Supabase: DATABASE_URL
- [ ] Cloudinary: cloud name + api key + secret
- [ ] Vimeo: access token
- [ ] Resend: api key
- [ ] Dominio: dónde lo compraste

> 💡 Podemos empezar SIN nada de esto en modo desarrollo (ya funciona con datos de prueba). Las credenciales se necesitan solo para salir a producción real.
