"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
* Name: 3D Bicycle Polygon Processing
* version: 1.0a
*
* 
* Author: Sarazhinskaya Maria
* 
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""


import json

def puka():
    import psycopg2
    coord = [[[37.653905633826646, 55.80273199556495], [37.6835512595208, 55.82042933966024], [37.7079412396416, 55.81153974590929], [37.68971564261697, 55.77764793210348], [37.653905633826646, 55.80273199556495]]]
    geom = {"type":"MultiPolygon", "coordinates": [coord]}
    descriptio = "test"
    status = 5

    conn = psycopg2.connect(
        database="testmap", user='postgres',
        password='postgres', host='localhost', port='5432'
    )

    cursor_postgis = conn.cursor()

    sql = '''insert into temp_data.velo_polygons (descriptio, status, geom) values (%s,%s,ST_AsText(ST_GeomFromGeoJSON(%s)))'''
    cursor_postgis.execute(sql, [descriptio, status, str(geom)])
    conn.commit()
    conn.close()

def polys_export():
    import psycopg2
    conn = psycopg2.connect(
        database="testmap", user='postgres',
        password='postgres', host='localhost', port='5432'
    )
    conn.autocommit = True
    cursor_postgis = conn.cursor()

    sql = '''select ST_AsGeoJSON(t.*) from geom.velo_polygons   AS t(geom) '''
    poly_obj = []
    i = 0
    cursor_postgis.execute(sql)
    for p in cursor_postgis:
        i += 1
        json_db = json.loads(p[0])
        #print(json_db)
        poly_obj.append({
            "geometry": {
                "type": "polygon",
                "rings": json_db['geometry']['coordinates'][0]
            },
            "attributes": {
                "id": i,
                "name": json_db['properties']['descriptio'],
                "status_id": json_db['properties']['status_id'],
                "operator": json_db['properties']['operator'],
                "status": json_db['properties']['status'],
            }
        })

    conn.commit()
    conn.close()
    return poly_obj

if __name__ == "__main__":
    #polys_export()
    puka()

