ymaps.ready(init);

function init() {
    const i18n = window.i18nManager;
    
    const branches = {
        main: {
            coords: [53.8945, 27.5477],
            hint: i18n.t('map.branch_main'),
            balloon: i18n.t('contacts.address')
        },
        west: {
            coords: [53.8940, 27.5400],
            hint: i18n.t('map.branch_west'), 
            balloon: i18n.t('contacts.address_west')
        },
        center: {
            coords: [53.8950, 27.5550],
            hint: i18n.t('map.branch_center'),
            balloon: i18n.t('contacts.address_center')
        }
    };

    var myMap = new ymaps.Map("map", {
        center: branches.main.coords,
        zoom: 13
    });

    const placemarks = [];

    Object.values(branches).forEach(branch => {
        var placemark = new ymaps.Placemark(branch.coords, {
            hintContent: branch.hint,
            balloonContent: branch.balloon
        }, {
            preset: 'islands#blueMedicalIcon'
        });

        myMap.geoObjects.add(placemark);
        placemarks.push({
            element: placemark,
            coords: branch.coords,
            hintKey: branch.hint === i18n.t('map.branch_main') ? 'map.branch_main' : 
                    branch.hint === i18n.t('map.branch_west') ? 'map.branch_west' : 'map.branch_center',
            balloonKey: branch.balloon === i18n.t('contacts.address') ? 'contacts.address' :
                       branch.balloon === i18n.t('contacts.address_west') ? 'contacts.address_west' : 'contacts.address_center'
        });
    });

    document.addEventListener('languageChanged', function() {
        updateMapContent(placemarks);
    });
}

function updateMapContent(placemarks) {
    const i18n = window.i18nManager;
    
    placemarks.forEach(placemarkData => {
        const { element, hintKey, balloonKey } = placemarkData;
        
        element.properties.set({
            hintContent: i18n.t(hintKey),
            balloonContent: i18n.t(balloonKey)
        });
    });
}