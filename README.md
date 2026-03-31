# FrontendCv: Analizador y Ponderador de Hojas de Vida

Este proyecto es una aplicación web enfocada en el análisis y ponderación de hojas de vida (CVs), generada con [Angular CLI](https://github.com/angular/angular-cli) versión 14.1.3.

## Servidor de desarrollo

Ejecuta `ng serve` para iniciar un servidor de desarrollo local. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

## Generación de código (Scaffolding)

Ejecuta `ng generate component nombre-componente` para generar un nuevo componente. También puedes usar `ng generate directive|pipe|service|class|guard|interface|enum|module`. Se recomienda crear los nuevos elementos dentro de sus respectivos módulos en la carpeta `features`.

## Construcción (Build)

Ejecuta `ng build` para compilar el proyecto. Los artefactos de compilación se almacenarán en el directorio `dist/` y estarán listos para ser desplegados en tu entorno de producción.

## Pruebas unitarias

Ejecuta `ng test` para lanzar las pruebas unitarias a través de [Karma](https://karma-runner.github.io).

## Pruebas de extremo a extremo (e2e)

Ejecuta `ng e2e` para lanzar las pruebas de integración. Para usar este comando, primero necesitas añadir un paquete que implemente capacidades de testing e2e en Angular.

## Más ayuda

Para obtener más información y ayuda sobre el uso de Angular CLI, utiliza el comando `ng help` o visita la página oficial de [Angular CLI Overview and Command Reference](https://angular.io/cli).
## Estructura del proyecto 
```
src/
├── app/
│   ├── core/                 (Servicios globales, interceptores, guards)
│   │   └── services/         (Ej. servicios HTTP genéricos)
│   ├── shared/               (Componentes UI reutilizables, pipes, directivas)
│   │   ├── components/       (Ej. botones, modales, alertas)
│   │   └── models/           (Interfaces genéricas)
│   └── features/             (Agrupación por módulos de negocio)
│       └── cv-analyzer/      (Tu módulo principal actual)
│           ├── components/   (Componentes visuales del analizador)
│           ├── models/       (Interfaces y tipos específicos del CV)
│           └── services/     (Servicios que procesan y ponderan los CVs)
├── assets/
└── environments/
```



