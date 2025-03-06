from flask_restx import Namespace, Resource, fields

ns = Namespace("products", description="Product related operations")

product_model = ns.model("Product", {
    "id": fields.Integer(readonly=True, description="ID of the Product"),
    "name": fields.String(required=True, description="Name of the Product")
})

products = []

@ns.route("/")
class ProductList(Resource):
    @ns.marshal_list_with(product_model)
    def get(self):
        """Obtain all Products"""
        return products

    @ns.expect(product_model)
    @ns.marshal_with(product_model, code=201)
    def post(self):
        """Add new Product"""
        new_product = ns.payload
        new_product["id"] = len(products) + 1
        products.append(new_product)
        return new_product, 201

