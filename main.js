var mockData = [
  {
    lat: -22.9601869,
    long: -43.2047572,
    store: {
      name: 'Loja 1 - RJ',
      address: 'Endereço da loja, 111, bairro, cidade, estado'

    }
  },
  {
    lat: -22.961471466038244,
    long: -43.20387311410906,
    store: {
      name: 'Loja 2 - RJ',
      address: 'Endereço da loja, 112, bairro, cidade, estado'

    }
  },
  {
    lat: -22.75947568167146,
    long: -43.46176475564391,
    store: {
      name: 'Loja 3 - Nova Iguaçu',
      address: 'Endereço da loja, 132, bairro, cidade, estado'

    }
  },
  {
    lat: -22.771822158473334,
    long: -43.36323112016985,
    store: {
      name: 'Loja 4 - Vilar dos Teles',
      address: 'Endereço da loja, 444, bairro, cidade, estado'

    }
  },
  {
    lat: -22.782866869854637,
    long: -43.286102776916316,
    store: {
      name: 'Loja 5 - Caxias',
      address: 'Endereço da loja, 555, bairro, cidade, estado'

    }
  },
  {
    lat: -22.722563785626694,
    long: -43.55953787919206,
    store: {
      name: 'Loja 6 - Queimados',
      address: 'Endereço da loja, 666, bairro, cidade, estado'

    }
  }
]

var events = {
  INIT_APPLICATION: 'events.INIT_APPLICATION'
}

var geoLocationAvailable = ("geolocation" in navigator) ? true : false
var currentLocation = { lat: -22.90338998500897, long: -43.19163490026312 }

var templates = {
  storeItemList: '<li><span class="store-distance"></span><span class="store-data"><span class="store-name"></span><span class="store-address"></span></span><span class="shipping-price"></span></li>'
}
var startLocation = { lat: -22.90338998500897, long: -43.19163490026312 } // Central do Brasil no RJ

function initMap() {
  var map = L.map('map-wrapper', {
    center: [startLocation.lat, startLocation.long],
    zoom: 15
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  return Promise.resolve(map)
}

$(document).ready(function () {
  if (geoLocationAvailable) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        currentLocation = { lat: position.coords.latitude, long: position.coords.longitude }
        $(document).trigger(events.INIT_APPLICATION)
      },
      function (err) {
        currentLocation = false
        $(document).trigger(events.INIT_APPLICATION)
      },
      {
        maximumAge: Infinity,
        timeout: 0
      }
    );
  }

  $(document).on(events.INIT_APPLICATION, function () {
    initMap().then(function (MapInstance) {
      var storeMarkers = []
      var $tpl = ''
      var $container = $('#container #sidebar .stores');

      if (currentLocation) {
        MapInstance.panTo([currentLocation.lat, currentLocation.long])
        var clientMarker = L.marker([currentLocation.lat, currentLocation.long]).addTo(MapInstance);
        var clientPopup = L.popup()
          .setLatLng([currentLocation.lat, currentLocation.long])
          .setContent('<p>You are here!</p>')

        clientMarker.bindPopup(clientPopup).openPopup()
      }

      mockData.forEach(function (v, i) {
        $tpl = $(templates.storeItemList)

        $tpl.attr('id', 'store-' + i)
        $tpl.attr('data-latitude', v.lat)
        $tpl.attr('data-longitude', v.long)
        $tpl.attr('data-markIndex', i)
        $tpl.find('.store-data .store-name').html(v.store.name)
        $tpl.find('.store-data .store-address').html(v.store.address)

        storeMarkers.push(
          L.marker([v.lat, v.long])
            .addTo(MapInstance)
            .bindPopup(
              L.popup()
                .setLatLng([v.lat, v.long])
                .setContent('<p>' + v.store.name + '<br>' + v.store.address + '</p>')
            )
        )

        if (currentLocation) {
          var from = turf.point([currentLocation.lat, currentLocation.long]);
          var to = turf.point([v.lat, v.long]);
          var options = { units: 'kilometers' };

          var distance = turf.distance(from, to, options);
          distance = (distance < 1) ? distance.toFixed(2) : distance.toFixed(0)

          $tpl.find('.store-distance').html(distance + 'km')
        }

        $tpl.on('click', function () {
          var i = $(this).attr('id').replace('store-', '')
          storeMarkers[i].openPopup();
          MapInstance.panTo([$(this).attr('data-latitude'), $(this).attr('data-longitude')])
        })

        $container.append($tpl)
      })

    }).catch(function (e) { console.error(e) })
  })

})