/* *************************************************************************
* Name: 3D Bicycle Polygon Processing
*version: 0.3a
* Done:
* 1. Fetching polygons from the postgresql database and displaying them on the map
* 2. Editing polygonal objects
* 3. Display of attribute information
*
* In progress:
* 4. Communication with the database on changing objects
* 5. Adding users to polygons
* 6. Adding a shooting folder on the server when selecting a polygon
*
* Author: Sarazhinskaya Maria
* Date: 07.02.2022
**************************************************************************** */

require([
        "esri/layers/WebTileLayer",
        "esri/Map",
        "esri/Basemap",
        "esri/widgets/BasemapToggle",
        "esri/views/SceneView",
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/FeatureLayer", //вызов класса Feature Layer - arcgis feature layer
        "esri/widgets/Editor",
        "dojo/request/xhr",
        "dojo",
        "esri/popup/content/CustomContent"

    ], (WebTileLayer, Map, Basemap, BasemapToggle, SceneView, MapView, WebMap,
    FeatureLayer, Editor, xhr, dojo, CustomContent) => {
        // основное тело скрипта
        // Create a WebTileLayer with a third-party cached service
        const mapBaseLayer = new WebTileLayer({
            urlTemplate: "https://stamen-tiles-{subDomain}.a.ssl.fastly.net/terrain/{level}/{col}/{row}.png",
            subDomains: ["a", "b", "c", "d"],


        });
        // Create a Basemap with the WebTileLayer. The thumbnailUrl will be used for
        // the image in the BasemapToggle widget.
        const stamen = new Basemap({
            baseLayers: [mapBaseLayer],
            title: "Terrain",
            id: "terrain",
            thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
        });

        const map = new Map({
            basemap: stamen,
            //ground: "world-elevation"
        });

        const view = new MapView({
            container: "viewDiv",
            map: map,
        });

        const popUpContent = new CustomContent({
            outFields: ["*"],
            creator: function (objpoly) {return createPopupContent(objpoly)}
        });

        const status = [
            {
                id: 1,
                name: "free"
            },{
                id:2,
                name: "closed"
            }
        ];

        function createAlert(){
            alert("Вы нажали кнопку.Молодец")
        };


        function createPopupContent(objpoly){
            let divp = document.createElement('div');

            //создание таблицы
            let table = document.createElement("table");
            let tr1 = document.createElement("tr");
            let td1_1 = document.createElement("td");
            td1_1.innerHTML = "Оператор";
            let td1_2 = document.createElement("td");
            td1_2.innerHTML = objpoly.graphic.attributes.operator;
            tr1.appendChild(td1_1);
            tr1.appendChild(td1_2);
            table.appendChild(tr1);

            let tr2 = document.createElement("tr");
            let td2_1 = document.createElement("td");
            td2_1.innerHTML = "Статус района";
            let td2_2 = document.createElement("td");
            let select = document.createElement("select");


            for (let stat in status){
                let opt = document.createElement('option')
                opt.value = status[stat].id
                opt.text = status[stat].name
                select.appendChild(opt)
            }

            select.addEventListener('change', () => {console.log(select.value)})
            /*
            let opt1 = document.createElement("option");
            let opt2 = document.createElement("option");
            opt1.value = "1";
            opt1.text = "Свободен";
            opt2.value = "2";
            opt2.text = "Зарезервирован";
            select.add(opt1, null);
            select.add(opt2, null);*/
            td2_2.appendChild(select)
            tr2.appendChild(td2_1);
            tr2.appendChild(td2_2);
            table.appendChild(tr2);
            //td2_2.innerHTML = "Статус";

            let tr3 = document.createElement("tr");
            let td3_1 = document.createElement("td");
            td3_1.innerHTML = "Описание";
            let td3_2 = document.createElement("td");
            let text_area = document.createElement("textarea");
            text_area.value = objpoly.graphic.attributes.name;
            td3_2.appendChild(text_area);
            tr3.appendChild(td3_1);
            tr3.appendChild(td3_2);
            table.appendChild(tr3);

            //создание кнопки
            let button = document.createElement("button");
            button.type = "button";
            button.innerHTML = "Click Me!";
            button.addEventListener("click", function (){createAlert()})

            // присоединение элементов к div
            divp.appendChild(table);
            divp.appendChild(button)
            return divp
        }



        view.center = [37.648704, 55.756632];
        view.zoom = 12;

        let layerPolygonNew2;

        view.when(() => {
            // Add a basemap toggle widget to toggle between basemaps
            const toggle = new BasemapToggle({
                visibleElements: {
                    title: true
                },
                view: view,
                nextBasemap: "satellite"
            });

            // Add widget to the top right corner of the view
            view.ui.add(toggle, "top-right");
        });
        const template = {content: [
            popUpContent
        ]};

        // создание слоя
        // наполнение слоя
        /*let responseObj;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://127.0.0.1:8080/JsonPoly/');
        xhr.responseType = 'json'
        xhr.send();
        xhr.onload = function() {
            responseObj = xhr.response;
        };*/
        /*xhr.onreadystatechange = function () {
            let data=xhr.response;
            let jsonResponse = JSON.parse(data);
            console.log(jsonResponse);
        };
        function create_source_polygon(){
            xhr.open('GET', 'http://127.0.0.1:8080/JsonPoly/').
            then(function (requestData){
                let jsonResponse = JSON.parse(requestData);
                console.log(jsonResponse);
            })
        };*/
        let url_site = 'http://192.168.10.157:8080/JsonPoly/'
        let url_site_main = 'http://192.168.10.157:8080/'
        function create_json_obj(){
            xhr(url_site,{
                headers: {"X-requested-With": null,
                },
                method: "GET",
                withCredentials: false,
            }).then(function(data){
                let data_json = JSON.parse(data);
                let renderer = {
                    type: "unique-value",  // autocasts as new UniqueValueRenderer()
                    field: "status_id",
                    defaultSymbol: {
                        type: "simple-fill",
                        color: "red",
                    },  // autocasts as new SimpleFillSymbol()
                    uniqueValueInfos: [{
                        value: 1,
                        symbol: {
                        type: "simple-fill",
                        color: "#007080",
                        //style:  "backward-diagonal"
                    }
                    }, {

                        value: 0,
                        symbol: {
                        type: "simple-fill",
                        color: "#ff7200"
                    }
                    }]
                };

                layerPolygonNew2 = new FeatureLayer({
                    source: data_json,
                    popupTemplate: template,
                    renderer: renderer,
                    fields: [
                        {
                            name: "ObjectID",
                            alias: "ObjectID",
                            type: "oid"
                        },
                        {
                            name: "name",
                            alias: "name",
                            type: "string"
                        },
                        {
                            name: "status_id",
                            alias: "status",
                            type: "integer"
                        },
                        {
                            name: "status",
                            alias: "status",
                            type: "string"
                        },
                        {
                            name: "operator",
                            alias: "operator",
                            type: "string"
                        }
                    ],

                    geometryType: "polygon",
                    opacity: 0.3
                });

                const editor = new Editor({
                    view: view,
                    layerInfos: [layerPolygonNew2],
                    snappingOptions: {
                    enabled: true, // sets the global snapping option that controls both geometry constraints (self-snapping) and feature snapping.
                    featureSources: [
                        {
                        layer: layerPolygonNew2
                        }
                    ]
                    }

                });


                view.ui.add(editor, "bottom-right");
                view.map.add(layerPolygonNew2);
                layerPolygonNew2.on("edits", function(event){
                    const extractObject = function(result) {
                        return result.objectId;
                    };
                    let dataOS = []
                    //на ивент передать айди объекта
                    const addedFeat = event.addedFeatures.map(extractObject);
                    //console.log(addedFeat)
                    if (addedFeat.length != 0){
                        get_os_attribute(addedFeat).then(function(result){

                            let added_el = {
                                "geometry" : result.features[0].geometry.rings,
                                "attributes": {
                                "id" : result.features[0].attributes.ObjectID,
                                "name" : result.features[0].attributes.name,
                                "status" : result.features[0].attributes.status
                            }
                            };
                            dataOS.push({'added': added_el, 'updates': null, 'deletes': null});
                            saveObjectsOS(dataOS);
                            console.log(added_el)

                        });
                    };
                    function saveObjectsOS(dataOS){

                        let xhrArgs = {
                                url: url_site_main + 'DataAdd/',
                                headers: {
                                'X-CSRFToken': CSRF_Token,
                                'Content-Type': 'application/json',
                            },
                                postData: dojo.toJson(dataOS),
                                handleAs: "text",
                                withCredentials: true,
                                load: function(data){
                                    console.log(data);
                                },
                                error: function(error){
                                    window.alert("Ошибка, try harder next time")
                                }

                        }
                        let deferred  = dojo.xhrPost(xhrArgs);
                        };
                });

            });
        };


        let source = [{
                "geometry":
                    {
                        type: "point",
                        x: 37.648828,
                        y: 55.756425
                    },
                "attributes":
                    {
                        ObjectID: 1,
                        Operator: "KATL",
                        //MsgTime: Date.now(),
                        Status: "UAL1"
                    }
            }
        ];

        let layerPointNew = new FeatureLayer({
            source: source,
            fields: [
                {
                name: "ObjectID",
                alias: "ObjectID",
                type: "oid"
                },
                {
                name: "Operator",
                alias: "Operator",//what will see user
                type: "string"
                },
                {
                name: "Status",
                alias: "Status",//what will see user
                type: "string"
                }
            ],
            objectIdField: "ObjectID",
            geometryType: "point",
            editingEnabled:false
        });


        const pointTest = {
            layer: layerPointNew,
            formTemplate: {
                elements:[
                    {
                        type: "field",
                        fieldName: "Status",
                        label: "Status"
                    }
                ]
            }
        };
        create_json_obj();

        async function get_os_attribute(os_ObjectID){
            let pointsQuery = layerPolygonNew2.createQuery();
            pointsQuery.where = 'ObjectID = ' + os_ObjectID;
            pointsQuery.outFields = ['*']
            let resultQuery = layerPolygonNew2.queryFeatures(pointsQuery).then(result => result);
            return resultQuery
        };

        // добавление слоя на карту
        view.map.add(layerPointNew);



});