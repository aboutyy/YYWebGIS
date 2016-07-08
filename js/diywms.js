                                                                      /**
 * Created by Administrator on 2016-03-28 0028.
 */
var view = new ol.View(
    {
        projection: new ol.proj.Projection({code:'EPSG:26713', units:'m'}),
        center:[599167,4921980],
        zoom:12
    });
var source = new ol.source.TileWMS(
    {
        url:'http://localhost:8080/geoserver/sf/wms',
        params:
        {
            'LAYERS':'sf:roads',
            'TILED':true
        }
    });
var wmsLayer = [
    new ol.layer.Tile(
        {
            source:source,
            serverType:'geoserver'
        })];
var map = new ol.Map({
    layers:wmsLayer,
    view:view
});
map.setTarget('map');
map.addControl(new ol.control.ZoomSlider());
map.addControl(new ol.control.MousePosition({
    coordinateFormate: ol.coordinate.createStringXY(4),
    projection: 'EPSG:26713',
    className:'custom-mouse-position',
    target: document.getElementById('mouse-position')
}))
map.addControl(new ol.control.ZoomToExtent({ }))
//        var ol3d = new olcs.OLCesium({map: map}); // map is the ol.Map instance
//        var scene = ol3d.getCesiumScene();
//        scene.terrainProvider = new Cesium.CesiumTerrainProvider({
//            url: 'https://assets.agi.com/stk-terrain/world'
//        });
//        ol3d.setEnabled(true);