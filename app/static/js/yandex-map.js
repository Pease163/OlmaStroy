/**
 * Yandex Maps — География работ ОлмаСТРОЙ
 */
(function () {
  'use strict';

  var MAP_CONTAINER = 'geo-map';
  var container = document.getElementById(MAP_CONTAINER);
  if (!container) return;

  ymaps.ready(function () {
    var map = new ymaps.Map(MAP_CONTAINER, {
      center: [63.0, 70.0], // Центр — ЯНАО
      zoom: 4,
      controls: ['zoomControl', 'fullscreenControl'],
    }, {
      suppressMapOpenBlock: true,
    });

    var offices = [
      {
        coords: [54.7104, 20.4522],
        title: 'Калининград — Центральный офис',
        desc: 'ул. Горького, 81А, ОЦ «Агат», оф. 405-412',
        color: '#CBFE0A',
      },
      {
        coords: [66.5300, 66.6200],
        title: 'ЯНАО',
        desc: 'Компрессорные станции, магистральные газопроводы',
        color: '#086EB5',
      },
      {
        coords: [52.2855, 104.2890],
        title: 'Иркутская область',
        desc: 'Участок «Сила Сибири»',
        color: '#086EB5',
      },
      {
        coords: [62.0355, 129.6755],
        title: 'Республика Саха (Якутия)',
        desc: 'Объекты газотранспортной системы',
        color: '#086EB5',
      },
      {
        coords: [59.9343, 30.3351],
        title: 'Ленинградская область',
        desc: 'Строительство инфраструктурных объектов',
        color: '#086EB5',
      },
      {
        coords: [55.7558, 37.6173],
        title: 'Московская область',
        desc: 'Проектный офис, инжиниринг',
        color: '#086EB5',
      },
      {
        coords: [45.0353, 38.9753],
        title: 'Краснодарский край',
        desc: 'Обустройство месторождений',
        color: '#086EB5',
      },
      {
        coords: [57.1530, 65.5343],
        title: 'Тюменская область',
        desc: 'Нефтегазовая инфраструктура',
        color: '#086EB5',
      },
    ];

    offices.forEach(function (office) {
      var placemark = new ymaps.Placemark(office.coords, {
        hintContent: office.title,
        balloonContentHeader: '<strong>' + office.title + '</strong>',
        balloonContentBody: office.desc,
      }, {
        preset: 'islands#dotIcon',
        iconColor: office.color,
      });
      map.geoObjects.add(placemark);
    });

    // Fit all markers
    if (map.geoObjects.getLength() > 1) {
      map.setBounds(map.geoObjects.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
    }
  });
})();
