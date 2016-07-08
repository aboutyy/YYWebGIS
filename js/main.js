/**
 * Created by Administrator on 2016-03-28 0028.
 */
var tian_di_tu_road_layer = new ol.layer.Tile({
    title: "路网",
    source: new ol.source.XYZ({
        url: "http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
    })
});
var tian_di_tu_annotation = new ol.layer.Tile({
    title: "标注",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}'
    })
});
var tian_di_tu_satellite_layer = new ol.layer.Tile({
    title: "影像",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}'
    })
});
//点矢量数据源
var pointSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function(){
        return 'http://localhost:8080/geoserver/test/wfs?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=test:shenghui&' +
            'outputFormat=application/json&srsname=EPSG:4326'
    }
});
//点图层
var pointVector = new ol.layer.Vector({
    title: "点",
    visible: true,
    source: pointSource
});
//线矢量数据源
var lineSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function () {
        return 'http://localhost:8080/geoserver/test/wfs?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=test:tielu&' +
            'outputFormat=application/json&srsname=EPSG:4326'
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom:16
    }))
});
//线图层
var lineVector = new ol.layer.Vector({
    title: "线",
    visible: false,
    source: lineSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(20, 100, 250, 0.8)',
            width: 2
        })
    })
});
//面矢量数据源
var areaSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function () {
        return 'http://localhost:8080/geoserver/test/wfs?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=test:xingzhengqujie&' +
            'outputFormat=application/json&srsname=EPSG:4326'
    },
    strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom:16
    }))
});
//面图层
var areaVector = new ol.layer.Vector({
    title: "面",
    visible: false,
    source: areaSource,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(155, 100, 150, 0.8)',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(155, 100, 150, 0.3)'
        })
    })
});
/**
 * 当前绘制的要素
 */
var sketch;
var meature_draw;
var draw_features = new ol.Collection();
var mysource = new ol.source.Vector({
    features: draw_features
});
var mylayer = new ol.layer.Vector({
    source: mysource,
    title: '用户层'
});
var map = new ol.Map({
    target: 'map',
    layers: [tian_di_tu_satellite_layer, lineVector, areaVector, pointVector],
    view: new ol.View({
        center: ol.proj.fromLonLat([119.294512,31.555583]),
        minZoom: 2,
        maxZoom: 18,
        zoom: 5
    })
});
map.addLayer(mylayer);

//////////////////////////////////////////////////////////////function/////////////////////////////////////////////////
function makeTable(container, data) {
    var table = $("<table/>").addClass('CSSTableGenerator');
    $.each(data, function(rowIndex, r) {
        var row = $("<tr/>");
        $.each(r, function(colIndex, c) {
            row.append($("<t"+(rowIndex == 0 ?  "h" : "d")+"/>").text(c));
        });
        table.append(row);
    });
    return container.append(table);
}

//显示地图元素信息
var displayFeatureInfo = function(pixel){
    var features = [];
    map.forEachFeatureAtPixel(pixel, function(feature, layer){
        features.push(feature);
    });
    if(features.length > 0){
        var info = [];
        for (var i = 0, ii = features.length; i< ii; ++i){
            info.push(features[i].get('PINYIN'));
        }
        document.getElementById('information').innerHTML = info.join(', ') || '(unknown)';
    }
    else{
        document.getElementById('information').innerHTML = '&nbsp;';
    }
};
//todo 添加显示多个属性的逻辑,此处只显示一个要素
function displayFeatureInfoInTable(pixel){
    $("#modal-info-container-table").empty()
    var features = [];
    map.forEachFeatureAtPixel(pixel, function(feature, layer){
        features.push(feature);
    });
    if(features.length > 0){
        var keys = features[0].getKeys();
        var values = [];
        for (var i = 0, ii = keys.length; i< ii; ++i){
            values.push(features[0].get(keys[i]));
        }
        var data = [keys, values];
        var html = '<table class="table"><thead><tr></tr></thead><tbody>';
        for (var i = 0, len = data.length; i < len; ++i) {
            html += '<tr>';
            for (var j = 0, rowLen = data[i].length; j < rowLen; ++j ) {
                html += '<td>' + data[i][j] + '</td>';
            }
            html += "</tr>";
        }
        html += '</tbody><tfoot><tr>属性表</tr></tfoot></table>';
        $("#modal-info").modal('show');
        $(html).appendTo('#modal-info-container-table');
    }
}

function displaySearchResultInTable(data){
    $("#modal-info-container-table").empty()
    var html = '<table class="table table-bordered"><thead><tr>...</tr></thead><tbody>';
    for (var i = 0, len = data.length; i < len; ++i) {
        html += '<tr>';
        for (var j = 0, rowLen = data[i].length; j < rowLen; ++j ) {
            html += '<td>' + data[i][j] + '</td>';
        }
        html += "</tr>";
    }
    html += '</tbody><tfoot><tr>....</tr></tfoot></table>';
    $("#modal-info").modal('show');
    $(html).appendTo('#modal-info-container-table');
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
selectFeature = new ol.interaction.Select({
    layers: [pointVector,lineVector,areaVector,mylayer],
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,100,50,0.5)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(255,100,50,0.8)'
        }),
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255, 100, 50, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(255, 100, 50, 0.8)'
            }),
            radius: 7
        }),
        toggleCondition: ol.events.condition.never,
        addCondition: ol.events.condition.altKeyOnly,
        removeCondition: ol.events.condition.shiftKeyOnly
    })
});

// a DragBox interaction used to select features by drawing boxes
var dragBox = new ol.interaction.DragBox({
    condition: ol.events.condition.platformModifierKeyOnly
});
selectedFeatures = selectFeature.getFeatures();
map.addInteraction(dragBox);
var infoBox = document.getElementById('info');
dragBox.on('boxend', function() {
    // features that intersect the box are added to the collection of
    // selected features, and their names are displayed in the "info"
    // div
    var info = [];
    var extent = dragBox.getGeometry().getExtent();
    map.getLayers().forEach(function (layer) {
        if(layer instanceof ol.layer.Vector){
            layer.getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
                selectedFeatures.push(feature);
            })
        }
    })
});
dragBox.on('boxstart', function() {
    selectedFeatures.clear();
});
var select = null;
var informationKey = null;
//选择按钮
$('#tb01').click(function(){
    map.removeInteraction(meature_draw);
    meature_draw = null;
    map.removeInteraction(draw);
    draw = null;
    map.unByKey(informationKey);
    if(select == null){
        select = selectFeature;
        map.addInteraction(select);
    }
});

//信息按钮
$('#tb02').click(function(){
    if(meature_draw){
        map.removeInteraction(meature_draw);
        meature_draw = null;
    };
    if(select == null){
        select = selectFeature;
        map.addInteraction(select);
    }
    informationKey = map.on('click', function(evt){
        var pixel = evt.pixel;
        displayFeatureInfoInTable(pixel);
    });
})

/////////////////////////////////////Draw////////////////////////////////////////////////////////////////////
var features = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector({features: features}),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});
//var modify = new ol.interaction.Modify({
//    features: draw_features,
//    // the SHIFT key must be pressed to delete vertices, so
//    // that new vertices can be drawn at the same position
//    // of existing vertices
//    deleteCondition: function(event) {
//        return ol.events.condition.shiftKeyOnly(event) &&
//            ol.events.condition.singleClick(event);
//    }
//});
//map.addInteraction(modify);
var draw; // global so we can remove it later
var typeSelect = document.getElementById('select-type');
function addDrawInteraction() {
    var type;
    switch(typeSelect.value)
    {
        case '点':
            type = 'Point';
            break;
        case '线':
            type = 'LineString';
            break;
        case '面':
            type = 'Polygon';
    }

    draw = new ol.interaction.Draw({
        source: mysource,
        type: /** @type {ol.geom.GeometryType} */ (type)
    });
    map.addInteraction(draw);
}
//Handle change event.
typeSelect.onchange = function() {
    map.removeInteraction(draw);
    addDrawInteraction();
};
$("#select-type").click(function(){
    if(meature_draw){map.removeInteraction(meature_draw);}
    if(!draw){addDrawInteraction();}
})
featureOverlay.setMap(map);

//测量按钮
$("#measure-button").click(function(){
    if(draw){map.removeInteraction(draw);}
    mylayer.setVisible(true);
})
//长度测量
$("#tb03").click(function(){
    if(select){
        map.removeInteraction(select);
        select = null;
    };
    map.removeInteraction(meature_draw);
    addInteraction("LineString");
})
//面积测量
$("#tb04").click(function(){
    if(select){
        map.removeInteraction(select);
        select = null;
    };
    map.removeInteraction(meature_draw);
    addInteraction("Polygon");
})
//清除测量结果
$("#tb-clear").click(function(){
    features.clear();
})

//删除要素
$("#tb10").click(function(){
    if(select!=null) {
        select.getFeatures().forEach(function(feature){
            select.getLayer(feature).getSource().removeFeature(feature);
        //select.getFeatures().clear();
        })
        select.getFeatures().clear();
    }
    })
//搜索按钮
$("#tb06").click(function(){
    //清空
    $('#select-search0 option').each(function(){
        $(this).remove();
    });
    $('#select-search1 option').each(function(){
        $(this).remove();
    });
    var keys = null;
    map.getLayers().forEach(function(layer){
        if (layer instanceof ol.layer.Vector){
            var name = layer.get('title');
            if(layer.get('visible')){
                if(name!='用户层'){
                    $("#select-search0").append($("<option></option>").attr("value", name).text(name));
                    keys = layer.getSource().getFeatures()[0].getKeys();
                }
            }
        }
    });
    for(i=0; i<keys.length;i++){
        $("#select-search1").append($("<option></option>").attr("value", keys[i]).text(keys[i]));
    }
    //$("#input-search0").val("PINYIN");
    //$("#input-search0").attr("readonly",true);
})
//搜索对话框搜索按钮
$("#btn-search").click(function () {
    $("#modal-searchfeature").modal("hide");
    var layerName = $("#select-search0").val();
    var featureName = $("#select-search1").val();
    var featureValue = $("#input-search1").val();
    var features = []
    map.getLayers().forEach(function (layer,index,array) {
        if (layer.get('title') == layerName) {
            layer.getSource().forEachFeature(function (feature) {
                if (feature.get(featureName) == featureValue) {
                    features.push(feature);
                }
            })
        }
    });
    if(features.length > 0){
        var data = [];
        var keys = features[0].getKeys();
        data.push(keys);
        extent = ol.extent.createEmpty();
        features.forEach(function (feature) {
            feature.setStyle(new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,100,50,0.5)'
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgba(255,0,0,0.8)'
                }),
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 100, 50, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 2,
                        color: 'rgba(255, 0, 0, 0.8)'
                    }),
                    radius: 7
                })
            }));
            ol.extent.extend(extent, feature.getGeometry().getExtent());
            var values = [];
            for(var i=0; i<keys.length; i++){
                values.push(feature.get(keys[i]));
            }
            data.push(values);
        });
        map.getView().fit(extent, map.getSize());
        displaySearchResultInTable(data);
    }
})
//$("#select-search0").on('change', function(e){
//    $("#select-1 option").each(function(){
//        $(this).remove();
//    })
//    var optionSelected = $("option:selected", this);
//    var valueSelected = this.value;
//    map.getLayers().forEach(function(layer){
//        if(layer.get('title') == valueSelected){
//            layer.getSource().getKeys().forEach(function(key){
//                $("#select-search1").append($("<option></option>").attr("value",key).text(key));
//            })
//        }
//    })
//})

//下载按钮
$("#tb11").click(function(){
    if(!select){
        $('#modal-download').modal('show');
        $("#select-download option").each(function(){
            $(this).remove();
        })
        map.getLayers().forEach(function(layer){
            if (layer instanceof ol.layer.Vector){
                if(layer.get('visible')){
                    var name = layer.get('title');
                    $("#select-download").append($("<option></option>").attr("value", name).text(name));
                }
            }
        });
    }
    else{
        ids = new Array();
        multiPoly = new ol.geom.MultiPolygon();
        select.getFeatures().forEach(function(feature){
            ids.push(feature.getId());
            geom = feature.getGeometry()
            if(geom instanceof ol.geom.Polygon){
                multiPoly.appendPolygon(geom);
            }
            else{
                alert("You must select only Polygons!!");
                return;
            }
            features = new Array();
            map.getLayers().forEach(function(layer){
                if(layer instanceof ol.layer.Vector){
                    if(layer.get('visible')){
                        layer.getSource().getFeatures().forEach(function(feature){
                            if(multiPoly.intersectsExtent(feature.getGeometry().getExtent())){
                                if($.inArray(feature.getId(), ids) == -1){
                                    features.push(feature);
                                }
                            }
                        })
                    }
                }
            })
            if(features.length > 0){
                var geoJsonObject = new ol.format.GeoJSON().writeFeatures(features);
                var data = "text/json;charset=utf-8," + encodeURIComponent(geoJsonObject);
                $("#tb11").attr('href','data:' + data);
                $("#tb11").attr('download','data' + '.geoJson');
            }
        })
    }
})
//下载按钮
$("#tb12").click(function(){
    if(!select){
        $('#modal-download').modal('show');
        $("#select-download option").each(function(){
            $(this).remove();
        })
        map.getLayers().forEach(function(layer){
            if (layer instanceof ol.layer.Vector){
                if(layer.get('visible')){
                    var name = layer.get('title');
                    $("#select-download").append($("<option></option>").attr("value", name).text(name));
                }
            }
        });
    }
    else{
        ids = new Array();
        multiPoly = new ol.geom.MultiPolygon();
        select.getFeatures().forEach(function(feature){
            ids.push(feature.getId());
            geom = feature.getGeometry()
            if(geom instanceof ol.geom.Polygon){
                multiPoly.appendPolygon(geom);
            }
            else{
                alert("You must select only Polygons!!");
                return;
            }
            features = new Array();
            map.getLayers().forEach(function(layer){
                if(layer instanceof ol.layer.Vector){
                    if(layer.get('visible')){
                        layer.getSource().getFeatures().forEach(function(feature){
                            if(multiPoly.intersectsExtent(feature.getGeometry().getExtent())){
                                if($.inArray(feature.getId(), ids) == -1){
                                    features.push(feature);
                                }
                            }
                        })
                    }
                }
            })
            if(features.length > 0){
                var geoJsonObject = new ol.format.GeoJSON().writeFeatures(features);
                var data = "text/json;charset=utf-8," + encodeURIComponent(geoJsonObject);
                $("#tb12").attr('href','data:' + data);
                $("#tb12").attr('download','data' + '.geoJson');
            }
        })
    }
})
//模态对话框下载按钮
$("#btn-download").click(function(){
    $("#modal-download").modal("hide");
    var downloadLayerName = $("#select-download").val();
    map.getLayers().forEach(function(layer){
        if(layer.get('title') == downloadLayerName){
            var geoJsonObject = new ol.format.GeoJSON().writeFeatures(layer.getSource().getFeatures());
            var data = "text/json;charset=utf-8," + encodeURIComponent(geoJsonObject);
            $("#btn-download").attr('href','data:' + data);
            $("#btn-download").attr('download',downloadLayerName + '.geoJson');
        }
    })
})

var pointerMoveHandler=function(evt){
    if(sketch){
        var output;
        var geom=(sketch.getGeometry());
        if(geom instanceof ol.geom.Polygon){
            output=formateArea(geom);
        }
        else if(geom instanceof  ol.geom.LineString){
            output=formateLength(geom);
        }
        document.getElementById('information').innerHTML=output;
    }
}
//检测是否为json字符串
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

var tempDownloadData;
$("#btn-download1").click(function(){
    if(tempDownloadData != null){
        $("#btn-download1").attr('href','data:' + tempDownloadData);
        $("#btn-download1").attr('download','data' + '.geoJson');
    }
    $("#modal_upload").modal("hide");
})

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    $("#upload-file-info").html($(this).val());
    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function(e){
            var data = e.target.result;
            if(isJson(data)){
                var features = new Array();
                var f = new ol.format.GeoJSON();
                var readFeatures = f.readFeatures(data);
                map.getLayers().forEach(function(layer){
                    if(layer instanceof ol.layer.Vector){
                        if(layer.get('visible')){
                            layer.getSource().getFeatures().forEach(function(feature){
                                readFeatures.forEach(function(readFeature){
                                    geom = readFeature.getGeometry();
                                    if(geom.intersectsExtent(feature.getGeometry().getExtent())){
                                        features.push(feature);
                                    }
                                })
                            })
                        }
                    }
                })
                var geoJsonObject = new ol.format.GeoJSON().writeFeatures(features);
                tempDownloadData = "text/json;charset=utf-8," + encodeURIComponent(geoJsonObject);
            }
        };

        // Read in the image file as a data URL.
        reader.readAsText(f);
    }
}
//上传范围按钮
$("#tb15").click(function () {
    $("#modal-upload").modal("show");
})
document.getElementById('load_files').addEventListener('change', handleFileSelect, false);
map.on('pointermove', pointerMoveHandler);
map.on('click', function() {
    selectedFeatures.clear();
});

//定位
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(overlay);
//模式对话框定位按钮
$("#positioning-btn").click(function(){
    var jingdu =  parseFloat($("#input-jingdu").val());
    var weidu = parseFloat($("#input-weidu").val());
    if(isNaN(jingdu) || isNaN(weidu)){
        alert("输入不正确");
    }
    else{
        map.getView().setCenter(ol.proj.fromLonLat([jingdu,weidu]));
        var hdms = ol.coordinate.toStringHDMS([jingdu,weidu]);
        content.innerHTML = '<p>Result Position:</p><code>' + hdms + '</code>';
        overlay.setPosition(ol.proj.fromLonLat([jingdu,weidu]));
        $("#modal-jingweidu").modal("hide");
    }
})
var closer = document.getElementById('popup-closer');
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

function addInteraction(type) {
    meature_draw = new ol.interaction.Draw({
        features: features,
        type: /** @type {ol.geom.GeometryType} */ (type)
    });
    map.addInteraction(meature_draw);
    var listener;
    meature_draw.on('drawstart',
        function(evt) {
            // set sketch
            sketch = evt.feature;
            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formateArea(geom);
                } else if (geom instanceof ol.geom.LineString) {
                    output = formateLength(geom);
                }
                document.getElementById('information').innerHTML=output;
            });
        }, this);

    meature_draw.on('drawend',
        function() {
            sketch = null;
            ol.Observable.unByKey(listener);
        }, this);
}
var formateLength=function(line){
    var length=Math.round(line.getLength()*100)/100;
    var output;
    if(length>100){
        output=(Math.round(length/1000*100)/100)+' '+'km';
    }
    else{
        output=(Math.round(length*100)/100)+' '+'m';
    }
    return output;
};
var formateArea=function(polygon){
    var area=polygon.getArea();
    var output;
    if(area>10000){
        output=(Math.round(area/100000*100)/100)+' '+ 'km<sup>2</sup>';
    }
    else{
        output=(Math.round(area*100)/100)+' '+'m<sup>2</sup>';
    }
    return output;
};

map.addControl(new ol.control.Zoom({}));
map.addControl(new ol.control.ZoomToExtent({label: 'E'}));
map.addControl(new ol.control.ZoomSlider({}));
var layerSwitcher = new ol.control.LayerSwitcher({tipLabel: '切换图层'});
map.addControl(layerSwitcher);
map.addControl(new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position')}));