class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        # Add 'description' and 'is_available' to the list
        fields = ['id', 'name', 'description', 'price', 'is_available']