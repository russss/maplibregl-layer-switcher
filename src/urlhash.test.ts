import { HashComponents, decodeHash, encodeHash } from "./urlhash";

test("decodeHash", () => { 
    expect(decodeHash("#10/51.505/-0.09")).toStrictEqual({
        center: [-0.09, 51.505],
        zoom: 10,
        layers: "",
    })

    expect(decodeHash("#10/51.505/-0.09/A,B,C")).toStrictEqual({
        center: [-0.09, 51.505],
        zoom: 10,
        layers: "A,B,C",
    })
})

test("Test hash encoding round trip", () => {
    let components: HashComponents = {}
    expect(decodeHash(encodeHash(components))).toStrictEqual(components)

    components.center = [-0.09, 51.505]
    components.zoom = 10
    components.layers = ""
    expect(decodeHash(encodeHash(components))).toStrictEqual(components)

    components.layers = "A,B,C"
    expect(decodeHash(encodeHash(components))).toStrictEqual(components)

});