from rest_framework import serializers
from .models import MenuItem, Category, Order, OrderItem
from users.serializers import UserSerializer

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='menu_item.name', read_only=True)
    price = serializers.DecimalField(max_digits=6, decimal_places=2, source='menu_item.price', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'quantity', 'item_name', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, source='orderitem_set', read_only=True)
    cart_items = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    customer_name = serializers.ReadOnlyField(source='customer.first_name')
    created_at_formatted = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'total_amount', 
            'delivery_address', 'special_instructions', 'status', 
            'created_at', 'created_at_formatted', 'items', 'cart_items'
            , 'preparing_at', 'delivered_at'
        ]
        read_only_fields = ['customer', 'created_at']

    def create(self, validated_data):
        cart_items = validated_data.pop('cart_items', [])
        order = Order.objects.create(**validated_data)
        
        calculated_total = 0
        for item in cart_items:
            item_id = item.get('id') or item.get('menu_item') or item.get('item_id')
            quantity = int(item.get('quantity', 1))
            
            if item_id:
                try:
                    menu_item = MenuItem.objects.get(id=item_id)
                    item_price = menu_item.price * quantity
                    calculated_total += item_price
                    OrderItem.objects.create(
                        order=order, 
                        menu_item=menu_item, 
                        quantity=quantity,
                        price=item_price
                    )
                except MenuItem.DoesNotExist:
                    continue

        order.total_amount = calculated_total
        order.save()
        return order