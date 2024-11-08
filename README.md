# Instrucciones para correr el código

Se tiene que tener instalado Docker para poder ejecutar la API localmente. Además se debe completar el .env siguiendo el formato de el archivo .env.template. Luego de tener docker instalado y las variables de entorno configuradas, ejecutar el siguiente comando en la rama develop.

```
docker compose -f dev-docker-compose.yml --env-file .env up --build -d
```

# Producción

La aplicación fue deployeada en render y la url es la siguiente:
https://zeller.onrender.com

La base de datos postgres también fue deployeada en Render, por lo que es accesible públicamente si se cuenta con la URL.

# Link Documentación Endpoints

https://documenter.getpostman.com/view/39549389/2sAY51A1cZ

# Supuestos

Supuse que el cliente tiene deudas, independiente si la dueDate es despues de la fecha de consulta. Si el cliente tiene en debts una lista vacía, significa que el cliente no tiene deudas.

# Explicación del Modelo Utilizado

Se escogió el modelo **GPT-4o mini** ya que es económico en términos de tokens. Las respuestas necesarias para el asistente de una automotora no requieren razonamiento muy complejo, por lo que este modelo es adecuado.

### Parámetros Seleccionados

- **Máximo de tokens: 250**  
  Inicié con 150 tokens, pero algunos mensajes se cortaban, especialmente en las últimas oraciones. Extender el límite a 250 asegura que el mensaje se entregue completo.

- **Temperature: 0.7**  
  Este valor mantiene un buen balance entre creatividad y precisión, generando respuestas variadas pero consistentes en el tono y el contenido que se espera del asistente.

- **Top_p: 1**  
  Con este ajuste, el modelo considera todos los tokens de mayor probabilidad, lo cual garantiza respuestas completas y relevantes.

- **Presence_penalty: 0.3**  
  Este valor fomenta cierta variabilidad, de modo que las respuestas no sean repetitivas y la conversación mantenga una fluidez natural entre cliente y asistente.

Estos parámetros aseguran que el asistente ofrezca respuestas claras y contextualizadas sin perder el estilo y tono amigable que se espera.

# Explicación de cómo se generó el prompt

Este prompt está diseñado para que el asistente virtual “Carlos” del concesionario Kaufmann interactúe de manera personalizada con los clientes.

### Detalles del Concesionario

Incluye información relevante de Kaufmann:

- **Modelos disponibles**: Toyota Corolla, Honda Civic y Ford Focus.
- **Sucursales y horarios**: Santiago, Viña del Mar, Concepción y Temuco, con sus respectivas direcciones y horarios.

### Personalización de Respuesta

El sistema identifica el nombre del cliente usando su `id`, permitiendo un saludo cercano. Además, se evalúa si el cliente tiene deudas y si requiere seguimiento para adaptar el mensaje en función de su situación financiera y la necesidad de seguimiento.

### Prompt Caching

Toda la información única del cliente, se incluyó al final del prompt, para así optimizar el prompt caching, lo que permite que las partes mas repetitivas como lo son las instrucciones que estan al principio del prompt, puedan ser reutilizadas y no se tengan que recomputar en cada request.

### Instrucciones para el Asistente

El asistente sigue estas pautas:

- **Cliente sin deudas**: Agradece al cliente por su responsabilidad financiera y le ofrece opciones de financiamiento.
- **Cliente con deudas**: Informa sobre las deudas pendientes y ofrece ayuda para regularizar la situación, destacando la posibilidad de financiamiento tras hacerlo.
- **Preguntas comunes**: Proporciona detalles de sucursales y horarios según la preferencia del cliente, y sugiere una cotización si se preguntan precios.
- **Seguimiento**: Si el cliente requiere seguimiento (está dentro de la lista de clientes que requieren seguimiento), se le invita a coordinar una visita en alguna sucursal.

### Contexto de Conversación

El prompt incluye el historial reciente de mensajes del cliente (últimos 3 mensajes), permitiendo que las respuestas se ajusten al contexto de la conversación.

# Ejemplos

A la pregunta de ¿Que autos tienen disponibles?, el asistente responde:

- Para el caso de un cliente moroso

```json
{
  "text": "Hola Pedro, gracias por tu interés en comprar un auto con nosotros. Entiendo que tienes deudas morosas. Estoy aquí para ayudarte a regularizar tu situación, ya que al hacerlo, podrás optar a opciones de financiamiento para el auto que más te guste.\n\nTe recomiendo que nos reunamos en una de nuestras sucursales para poder conversar sobre tus opciones y cómo podemos ayudarte. ¿Tienes alguna preferencia de sucursal? Te puedo informar sobre los horarios y direcciones:\n\n- Santiago: Av. Apoquindo 321, horario: 9:00 - 18:00.\n- Viña del Mar: Calle Quinta Vergara 255, horario: 9:00 - 17:00.\n- Concepción: Calle Principal 123, horario: 10:00 - 17:00.\n- Temuco: Avenida los Pablos 4356, horario: 10:00 - 17:00.\n\nEspero tu respuesta para coordinar la visita. ¡Estoy aquí para ayudarte!"
}
```

- Para el caso de un cliente sin morosidad

```json
{
  "text": "Hola Carlos, ¡gracias por tu interés en nuestros vehículos! Veo que no tienes deudas morosas, lo cual es excelente. \n\nEn cuanto a los modelos que ofrecemos, lamentablemente no contamos con un modelo SUV. Sin embargo, tenemos el Toyota Corolla, Honda Civic y Ford Focus, que son autos muy populares y confiables. \n\nRespecto al financiamiento, podemos ofrecerte opciones atractivas para cualquiera de estos modelos. ¿Te gustaría que te envíe más detalles sobre las tasas de interés y los plazos disponibles?\n\nAdemás, me gustaría saber si tienes alguna preferencia por la sucursal en la que quisieras realizar la prueba de manejo o conversar sobre el financiamiento. Recuerda que estamos en Santiago (Av. Apoquindo 321), Viña del Mar (Calle Quinta Vergara 255), Concepción (Calle Principal 123) y Temuco (Avenida los Pablos 4356). Cada sucursal tiene horarios distintos, así que dime cuál te queda mejor.\n\nEspero tu respuesta para poder ayudarte mejor. ¡Gracias por ser un cliente leal!"
}
```

# Mejoras o Extensiones que se podrían hacer

Es peculiar que uno tenga que hacer un GET para tener una respuesta de un asistente virtual. El modelo debería estar entrenado de antes con RAG para tener las capacidades de un modelo de AI generativa, pero además tener la información propia de la automotora, como lo son los modelos que tienen en sus sucursales, así se tienen todos los beneficios del modelo estándar de GenAI para responder de forma natural, pero se ciñe a la información propia de la automora para dar a los clientes la respuesta mas acertada acorde a la realidad. Además, con un entrenamiento previo se puede evitar sobrecargar en cantidad de tokens cada vez que se hace una request, puesto que actualmente cada vez que se hace una request se leen todas las marcas y modelos actuales, haciendolo ineficiente y costoso.

Por otro lado, la idea es que la API permita que la interacción sea tipo chatbot. Actualmente la implementación no es así, se supone que el cliente siempre quiere saber los autos que tienen disponibles. Además, probablemente un cliente solo quiera saber la disponibilidad en una sucursal específica y no saber todos los autos que tienen disponible la automora.

Una mejora que se puede implementar es agregar a Client mas atributos, tales como edad, sexo, comuna, trabajo, entre otros, para así hacerle recomendaciones mas específicas respecto a los autos que les pueda interesar. Por ejemplo, si se tiene a un hombre de 35 años que vive en Temuco y trabaja en el sector de agricultura, se le podría poner mas énfasis en recomendarle la pickup clase X, dado que es probable que le pueda interesar mas que un clase S.
