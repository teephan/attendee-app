// global variables
var map;
var geo;
var address;
var infoWindow;

//https://www.eventbriteapi.com/v3/events/search/location.within=10km&location.latitude=${currentLat}&location.longitude=${currentLong}&expand=organizer,venue&token=FPUVLNLD5P7BWCLEQL2Y
//https://www.eventbriteapi.com/v3/events/search/?location.address=Toronto&location.within=20km&expand=organizer,venue&token=FPUVLNLD5P7BWCLEQL2Y


// initialize map
function initMap() {
  geo = new google.maps.Geocoder();

  // show default position on map onload
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 43.6425662,
      lng: -79.3870568
    },
    zoom: 8
  });


// allow map to search address (codeAddress) on enter and submit button click
var addressInput = document.getElementById('addressInput');
addressInput.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    document.getElementById('search').click()
  }
})


// 1 Grab search input value and display on map 
// document.getElementById('search').onclick = 
function codeAddress() {
  
  address = document.getElementById('addressInput').value;

  geo.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.fitBounds(results[0].geometry.viewport);

      // callback function to use lat and long NOT IN USE
      // results[0].geometry.location.lat();
      // results[0].geometry.location.lng();

      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          icon: `https://i.imgur.com/gyFX7j1.png`
      });
    } else {
      alert('Search results failed. Please type in your full address.' + status);
    }
    // reset the input values
    $("input[type='text']").val(''); 
  });
}

//2. pass coordinates to Eventbrite to display events near me 
function getAllEvents() {

  // fetch data using template literal of input value variable (address)
  fetch(`https://www.eventbriteapi.com/v3/events/search/?location.address=${address}\`&location.within=1km&expand=organizer,venue&token=FPUVLNLD5P7BWCLEQL2Y`)
  .then((res) => {
    return res.json();
   })

  .then((jsonData) => {
    jsonData.events.map((event) => {
      
      var lat = event.venue.latitude;
      var long = event.venue.longitude;
      var myLatlng = new google.maps.LatLng(parseFloat(lat),parseFloat(long));


      // map.setCenter(address.getPosition());    //marker is marker to center on
      map.setZoom(14);


      // var cat_id = event.category_id;
      // if (cat_id === 113) {
      // }

      // adding content from EB to display in the infowindow 
      var contentString = 
        `<div id="content">
        <h3>${event.name.text}</h3>
        <h4>${event.venue.address.address_1}</h4>
        <h4>${event.start.local}</h3>
        <strong><a href="${event.url}" target="_blank">View on EventBrite</a></strong>
        <p>${event.description.text}</p>
        </div>`;

      // infowindow variable
      infoWindow = new google.maps.InfoWindow({
        maxWidth: 300
      });

      // clicking anywhere on map closes the infowindow
      var closeInfoWindow = new google.maps.event.addListener(map, 'click', function(event) {
        infoWindow.close();
      });

      // generate map markers and onclick opens infowindow
      var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        info: contentString
      });

      // usage of info + this helps prevent bug that causes every infowindow to display the same content
      // must place content into marker rather than infoWindow, otherwise the marker displays the information of the most current marker
      google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent( this.info );
      infoWindow.open( map, this );
      });

    })
  })
}

// START OF CATEGORIZATION

// function convertCategoryId(categoryId) {
//   return fetch(`https://www.eventbriteapi.com/v3/categories/${categoryId}/?token=FPUVLNLD5P7BWCLEQL2Y`)
//   .then((response) => {
//     return response.json()
//   })
//   .then((categoryData) => {
//     return categoryData.name
//   })
//   .catch((err) => {
//     console.log(err);
//   })
// }
// }

// on click of search, run the below functions
document.getElementById('search').addEventListener('click', function(){
  codeAddress();
  getAllEvents();
});

}

// load map function
google.maps.event.addDomListener(window, 'load', initMap);



