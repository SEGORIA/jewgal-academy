"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import type { AnalyticsSettings } from "@/lib/analytics-settings"

/**
 * Scripts de analítica configurados en el panel (Configuración → General → Analítica). Sin IDs no carga nada.
 * Los IDs ya llegan validados con un formato estricto (solo letras, números y guiones), por eso es seguro incrustarlos.
 * Si «respetar No rastrear» está activo, no se carga nada para quien tiene esa opción en el navegador.
 */
export default function TrackingScripts({ ga4, gtm, metaPixel, respectDnt }: Pick<AnalyticsSettings, "ga4" | "gtm" | "metaPixel" | "respectDnt">) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & { msDoNotTrack?: string }
    const dnt = nav.doNotTrack === "1" || nav.msDoNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1"
    setEnabled(!(respectDnt && dnt)) // eslint-disable-line react-hooks/set-state-in-effect -- depende de una API del navegador que no existe en el servidor
  }, [respectDnt])

  if (!enabled || (!ga4 && !gtm && !metaPixel)) return null
  return (
    <>
      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      {ga4 && !gtm && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}</Script>
        </>
      )}
      {metaPixel && (
        <Script id="meta-pixel-init" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixel}');fbq('track','PageView');`}</Script>
      )}
    </>
  )
}
