---
title: Cómo verifican realmente los clientes comerciales a un piloto Part 107 en 2026
date: 2026-05-22
excerpt: Un número de certificado impreso no prueba gran cosa. Aquí te explicamos cómo los clientes están empezando a exigir credenciales verificables, y qué tienen que ver la tarjeta de piloto en Apple Wallet, las páginas de perfil público y los briefings verificables por SHA-256 con conseguir más trabajo.
readTime: 8 min de lectura
---

## La pregunta que todo piloto comercial escucha tarde o temprano

Cotizas un trabajo —una inspección de techo, una propiedad inmobiliaria, la cobertura de un evento— y el cliente responde con una línea que no había aparecido en ninguna de tus conversaciones anteriores:

**"¿Puedes enviarme una prueba de que tienes licencia?"**

La pregunta suena simple. Casi nunca lo es. El cliente no quiere una captura de pantalla. Una captura de pantalla de una tarjeta de la FAA no prueba nada: cualquiera con cinco minutos puede falsificarla. Recortar una fecha de un certificado viejo, pegar la foto de otra persona en un PDF, "tomar prestado" el número Part 107 de un amigo: nada de eso es difícil. El hecho de que los pilotos envíen rutinariamente fotos de certificados por mensaje y los clientes rutinariamente las acepten no es porque el sistema funcione. Es porque el sistema aún no ha sido puesto a prueba.

Eso está cambiando. Los clientes comerciales más grandes —empresas de servicios públicos, aseguradoras, municipios, cualquiera cuyo abogado haya tocado un contrato de dron recientemente— se están poniendo más astutos. Quieren algo que puedan verificar de verdad. Y los pilotos que pueden presentarse con credenciales verificables están empezando a conseguir el trabajo.

Este artículo trata sobre lo que realmente significan las credenciales verificables para un piloto Part 107, qué está pidiendo en realidad un cliente cuando pide una "prueba" y cómo prepararte para que la respuesta sea "sí, aquí está el enlace" en lugar de "déjame enviarte una captura de pantalla".

## Qué significa realmente "verificable"

Una credencial es *verificable* cuando un tercero —tu cliente, una aseguradora, un abogado— puede confirmar de forma independiente que es real, sin tener que confiar en que tú digas la verdad. Hay tres propiedades que importan:

1. **La credencial se asocia a una única persona identificable.** No solo un número, sino un nombre, una foto, un identificador estable que vincule el documento a un ser humano.
2. **La verificación no pasa por ti.** El cliente debería poder abrir algo —un enlace, una tarjeta, una página de perfil— sin tu teléfono en la mano.
3. **La verificación está vigente.** Un certificado que era real en 2022 no prueba nada en 2026 si el piloto dejó que caducara.

El FAA Airman Registry cumple las tres. Es una base de datos pública. Puedes buscar por número de certificado o por nombre, y te dice si alguien tiene un Remote Pilot Certificate activo. Esa es la verificación estándar de referencia, y la mayoría de los pilotos comerciales nunca le ha dicho a un cliente que existe, porque ellos mismos no lo sabían.

Pero el registro tiene límites. Devuelve un nombre. No devuelve un historial de vuelos, una póliza de seguro ni nada más que un cliente pudiera querer ver junto al certificado. Y los clientes tienen que saber que deben buscar ahí en primer lugar, cosa que la mayoría no sabe.

Esa brecha —entre "técnicamente la FAA permite que cualquiera verifique tu certificado" y "el cliente realmente lo hace"— es donde entran las credenciales digitales verificables.

## Las tres cosas que los clientes realmente intentan confirmar

Cuando un cliente pide una prueba, casi nunca quiere solo el número de certificado. Quiere respuestas a tres preguntas implícitas. Si puedes responder las tres en un solo enlace, ganas el trabajo.

**Pregunta 1: "¿Eres un piloto con licencia de verdad?"** Esta es la pregunta del FAA Airman Registry. Un número de certificado real, un estado activo, tu nombre asociado.

**Pregunta 2: "¿Realmente has volado antes, o solo aprobaste el examen?"** Un piloto primerizo con un certificado recién obtenido es técnicamente legal y operativamente no probado. Un piloto con cien vuelos registrados es otra propuesta. Los clientes no siempre saben articular esta distinción, pero la sienten en el momento en que ven un historial de vuelos.

**Pregunta 3: "Si algo sale mal, ¿quién responde?"** El seguro. O tienes una póliza comercial de responsabilidad por drones o no la tienes. Si la tienes, la póliza tiene un número, una aseguradora, un monto de cobertura y un rango de fechas. Si no la tienes, el abogado del cliente quiere saberlo antes de que salgan los contratos, no después de que un dron impacte una ventana.

Enviar una captura de pantalla de tu certificado responde tal vez una pregunta y media de esas, mal. Una credencial verificable real responde las tres en un solo lugar.

## La tarjeta de piloto en Apple Wallet

Esta es la respuesta más limpia a la pregunta "envíame una prueba de que tienes licencia", y vive en un hardware en el que el cliente ya confía. Un pase de Apple Wallet es un objeto PassKit: un pequeño documento estructurado, firmado criptográficamente por el emisor (en nuestro caso, el certificado de firma de PreFlight 107), almacenado en el iPhone del cliente justo al lado de sus tarjetas de embarque y tarjetas de crédito.

Cuando generas una tarjeta de piloto en PreFlight 107 Pro, obtienes un archivo `.pkpass`. Puedes enviarlo por AirDrop, por mensaje o por correo. El destinatario toca "Agregar a Wallet" y ahora tus credenciales viven en su teléfono. La tarjeta muestra:

- Tu nombre y (opcionalmente) una foto
- Tu número de certificado Part 107
- Tu código de cuenta estable de PreFlight 107 (el identificador público)
- Un enlace a tu perfil público, que es donde ocurre la verificación

La tarjeta en sí no es la prueba. La tarjeta es el *asidero* de la prueba. Es lo que vive en el bolsillo del cliente, con tu nombre, listo para tocarse cuando necesiten recordar quién eres o buscarte de nuevo.

Dos cosas que hay que decir con honestidad. Primero: un pase de Apple Wallet no es una credencial emitida por la FAA. La FAA no opera un programa de billetera digital. El pase es una credencial que nosotros emitimos, firmada por nosotros, que *apunta* a credenciales que la FAA *sí puede* confirmar. Decimos "Verified Part 107 Pilot" en el pase porque el usuario nos dijo que lo es, y la tarjeta incluye el número de certificado para que el destinatario lo verifique de forma independiente. Por eso también nuestra página de perfil público incluye la línea "credenciales autoinformadas, verifique el estado Part 107 de forma independiente en el FAA Airman Registry". El marketing honesto gana a la larga.

Segundo: Apple Wallet funciona en iPhone. Los usuarios de Android pueden recibir el equivalente a través de Google Pay o un enlace web compartido, pero la elegancia del flujo de AirDrop-a-Wallet es una experiencia exclusiva del iPhone por ahora. Durante el próximo año o dos, los pilotos cuyos clientes están mayormente en iPhone obtienen el mayor beneficio de esta función.

## La página de perfil público

Esto es lo que hace la verificación de verdad. Cada suscriptor Pro obtiene una página web pública en `preflight107.com/pilot/<account-code>`: una URL real que el cliente puede abrir en cualquier navegador, sin necesidad de app.

La página muestra:

- Nombre del piloto (tal como lo ingresaste)
- Una insignia "Verified Part 107 Pilot", solo si ingresaste un número de certificado, con un pie que aclara que es autoinformado y que apunta al registro de la FAA
- Un resumen del historial de vuelos: total de vuelos registrados, total de horas de vuelo, fecha del último vuelo
- Detalles de la tarjeta de seguro si agregaste una póliza
- El nombre y la información de contacto de tu negocio (si elegiste hacerlos públicos)

El propósito de la página es que consolida todo lo que un cliente pediría de otra forma por partes —certificado, horas, seguro, datos del negocio— en una sola URL que puede abrir en un navegador en su escritorio, compartir con su equipo de cumplimiento o imprimir a un archivo para su carpeta del trabajo.

La página también es donde el cliente puede tocar "Agregar a Apple Wallet" por su cuenta, si le enviaste el enlace en lugar del pase directamente. Compartir la URL es más amigable que enviar un archivo: los enlaces son fáciles de reenviar, fáciles de marcar como favoritos y no despiertan ningún instinto de "¿esto es un virus?".

## Los briefings a prueba de manipulaciones cierran el último ciclo

Para la mayoría de los trabajos, una tarjeta de piloto y un perfil público bastan. El cliente confirma que eres real, contrata el trabajo, recibe el entregable. Listo.

Para trabajos más exigentes —empresas de servicios públicos, gobierno, cualquier cosa que involucre un reclamo de seguro o una inspección de seguridad pública— la conversación va un paso más allá. El cliente quiere ver, después de los hechos, que realmente hiciste la planificación que dijiste que hiciste antes de cada vuelo. Ahí es donde entran los Mission Briefings.

Cada PDF de Mission Briefing generado por PreFlight 107 incluye un hash criptográfico SHA-256 al pie de cada página, además de un código de briefing como `MB-XKA5RC`. Ese hash se calcula al momento de la generación a partir de los datos del clima, el estado del espacio aéreo, los peligros, los NOTAMs, el bloque del piloto y otro contenido autoritativo capturado para ese briefing, y se almacena en nuestra base de datos.

Si alguien modifica el PDF —cambia una velocidad del viento, altera una marca de tiempo, edita la línea de firma—, el hash impreso en el documento deja de coincidir con el hash en archivo. Cualquiera puede verificar un briefing en `preflight107.com/verify`. Pega el hash y la página informa si el documento es auténtico, cuándo se generó, para qué misión fue (a menos que lo hayas generado en modo de cliente de marca blanca) y las iniciales del piloto.

La página de verificación es pública, no requiere inicio de sesión y revela solo los metadatos mínimos necesarios para confirmar la autenticidad. Los detalles sensibles —identidad completa del piloto, números de certificado, coordenadas exactas, números de póliza de seguro— nunca quedan expuestos por el punto de verificación. Solo lo que un tercero legítimamente necesita para confirmar "sí, este PDF es real".

## El stack práctico

Así se conecta todo en una interacción real con un cliente.

Cotizas un trabajo. El cliente pide prueba de credenciales. Envías tres cosas:

1. Un archivo `.pkpass` (la tarjeta de piloto de Apple Wallet): lo agregan a su teléfono en dos toques
2. Un enlace a tu perfil público: pueden mostrárselo a su encargado de cumplimiento sin reenviar archivos
3. Una nota breve: "Si necesitas documentación de vuelo verificada por misión, proporciono PDFs de Mission Briefing a prueba de manipulaciones para cada vuelo, verificables en preflight107.com/verify".

Tres mensajes. Tres minutos. Cada pregunta del cliente respondida, cada afirmación verificable de forma independiente.

Compáralo con la versión en la que capturas tu tarjeta de la billetera, escribes tu número de certificado en un mensaje, desentierras tu página de declaración de seguro de un PDF enterrado en tu carpeta de descargas y lo envías como archivo adjunto por correo.

La misma información. Una señal radicalmente distinta.

## Una palabra sobre la honestidad

Vale la pena decirlo en voz alta: el objetivo de las credenciales verificables no es parecer impresionante. Es hacer que la verificación sea trivialmente fácil para el cliente. Los pilotos que usan estas herramientas para maquillar credenciales dudosas van a perder, y feo, la primera vez que un cliente realmente verifique. El FAA Airman Registry sigue teniendo la última palabra. El hash de tu Mission Briefing sigue teniendo que coincidir con lo que está en la base de datos. El conteo de vuelos en tu perfil público sigue calculándose a partir de tus vuelos registrados: no puedes falsearlo sin falsear los vuelos.

Los pilotos que ganan con estas herramientas son los pilotos que ya hacen el trabajo —vuelan vuelos reales, tienen seguro real, mantienen registros reales— y quieren una forma limpia y profesional de comunicarlo a los clientes. Las herramientas son un megáfono para pilotos honestos, no un disfraz para los deshonestos.

## Por dónde empezar

Si eres un piloto Part 107 en activo y quieres configurar credenciales verificables esta semana:

1. **Ingresa tu número de certificado Part 107 en PreFlight 107.** Esto desbloquea la insignia Verified Part 107 en tu perfil público y la línea del certificado en tu tarjeta de Wallet.
2. **Agrega el nombre de tu negocio y (si aplica) tu póliza de seguro.** Ambos se muestran en tu perfil público y en tu tarjeta de Wallet.
3. **Registra cada vuelo.** Tu perfil público muestra tu conteo de vuelos y tus horas totales calculadas a partir de tus registros reales.
4. **Genera la tarjeta de piloto de Apple Wallet** en la pantalla Pilot Card. Envíatela por AirDrop o mensaje primero, confirma que el formato se ve bien y luego envíasela a tu próximo cliente.
5. **Marca como favorita la URL de tu perfil público**: es el enlace que envías cuando alguien pide "envíame una prueba de que tienes licencia".

Para pilotos que necesitan el stack completo de credenciales, incluidos los briefings a prueba de manipulaciones por vuelo, ese es el nivel Pro+. Para la mayoría de los operadores, el nivel Pro Pilot —que incluye la tarjeta de Wallet y el perfil público— es suficiente para empezar.

Los clientes a los que les importa lo notarán. A los que no les importa también terminarán notándolo.

Vuela seguro, y demuéstralo.
