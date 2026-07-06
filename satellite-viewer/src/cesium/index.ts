import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

// 1. 静态资源路径
window.CESIUM_BASE_URL = "/Cesium/";

// 2. token（必须最早）
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTE4NjNkNC0wNGI2LTQ4ZGItYWE5My1lYWUxMDU0MDBhOWUiLCJpZCI6NDUyODYyLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODMzMDg0OTF9.oWll3Sdsw3mtsoVE521wXKhJKhiaCDtf5Byc3_UbUFo";

export default Cesium;