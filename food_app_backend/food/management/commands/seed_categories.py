# from django.core.management.base import BaseCommand
# from food.models import Category

# class Command(BaseCommand):
#     help = 'Seeds initial default menu categories'

#     def handle(slef, *args, **kwargs):
#         categories_to_create = ['Veg', 'Jain', 'Drink']
        
#         for cat_name in categories_to_create:
#             category, created = Category.objects.get_or_create(name=cat_name)
#             if created:
#                 print(f"Created category: {cat_name}")
#             else:
#                 print(f"Category already exists: {cat_name}")
        
#         print("Category seeding completed successfully!")


from django.core.management.base import BaseCommand
from food.models import Category, MenuItem

class Command(BaseCommand):
    help = 'Seeds categories with 10 dummy items and direct image URLs each'

    def handle(self, *args, **kwargs):
        menu_data = {
            'Veg': [
                {
                    'name': 'Paneer Tikka', 
                    'price': 180.00, 
                    'description': 'Spicy grilled cottage cheese chunks marinated in yogurt and spices.', 
                    'image': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80'
                },
                {
                    'name': 'Dal Makhani', 
                    'price': 150.00, 
                    'description': 'Rich and creamy slow-cooked black lentils with butter and cream.', 
                    'image': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80'
                },
                {
                    'name': 'Veg Biryani', 
                    'price': 200.00, 
                    'description': 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices.', 
                    'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80'
                },
                {
                    'name': 'Malai Kofta', 
                    'price': 220.00, 
                    'description': 'Deep-fried potato and paneer dumplings in a rich, smooth creamy gravy.', 
                    'image': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80'
                },
                {
                    'name': 'Chole Bhature', 
                    'price': 140.00, 
                    'description': 'Spicy chickpea curry served with fluffy deep-fried leavened bread.', 
                    'image': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80'
                },
                {
                    'name': 'Stuffed Paratha', 
                    'price': 90.00, 
                    'description': 'Whole wheat flatbread stuffed with spiced potatoes and baked with butter.', 
                    'image': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'
                },
                {
                    'name': 'Palak Paneer', 
                    'price': 190.00, 
                    'description': 'Soft cottage cheese cubes cooked in a smooth, vibrant spinach gravy.', 
                    'image': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'
                },
                {
                    'name': 'Veg Manchurian', 
                    'price': 160.00, 
                    'description': 'Indo-Chinese crispy vegetable balls tossed in a tangy soy-garlic sauce.', 
                    'image': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80'
                },
                {
                    'name': 'Kadhai Mushroom', 
                    'price': 210.00, 
                    'description': 'Fresh button mushrooms cooked with bell peppers in a freshly ground spice blend.', 
                    'image': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80'
                },
                {
                    'name': 'Ajeera Rice', 
                    'price': 110.00, 
                    'description': 'Long-grain basmati rice gently tempered with aromatic cumin seeds and ghee.', 
                    'image': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80'
                },
            ],
            'Jain': [
                {
                    'name': 'Jain Special Thali', 
                    'price': 250.00, 
                    'description': 'Strictly no root vegetables, pure, divine and wholesome meal platter.', 
                    'image': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80'
                },
                {
                    'name': 'Plain Sada Dosa', 
                    'price': 80.00, 
                    'description': 'Crispy golden crepe served with coconut chutney (Jain style).', 
                    'image': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80'
                },
                {
                    'name': 'Jain Paneer Butter Masala', 
                    'price': 210.00, 
                    'description': 'Creamy tomato-based paneer gravy prepared completely without onion or garlic.', 
                    'image': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80'
                },
                {
                    'name': 'Raw Banana Cutlet', 
                    'price': 120.00, 
                    'description': 'Crispy pan-fried raw banana patties spiced with green chilies and cumin.', 
                    'image': 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&q=80'
                },
                {
                    'name': 'Jain Veg Fried Rice', 
                    'price': 170.00, 
                    'description': 'Stir-fried rice tossed with approved green veggies, ginger, and soy sauce.', 
                    'image': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80'
                },
                {
                    'name': 'Green Peas Pulao', 
                    'price': 140.00, 
                    'description': 'Aromatic rice cooked with fresh green peas and mild whole spices.', 
                    'image': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80'
                },
                {
                    'name': 'Jain Mix Veg Curry', 
                    'price': 160.00, 
                    'description': 'Assorted green vegetables simmered in a rich tomato-melon seed gravy.', 
                    'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80'
                },
                {
                    'name': 'Stuffed Tomato Jain', 
                    'price': 180.00, 
                    'description': 'Juicy tomatoes stuffed with paneer and spices, gently baked in a pan.', 
                    'image': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'
                },
                {
                    'name': 'Jain Corn Palak', 
                    'price': 190.00, 
                    'description': 'Sweet corn kernels cooked in a pureed spinach base without root seasonings.', 
                    'image': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80'
                },
                {
                    'name': 'Khaman Dhokla Jain', 
                    'price': 90.00, 
                    'description': 'Fluffy, savory steamed gram flour cake tempered with mustard and green chilies.', 
                    'image': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80'
                },
            ],
            'Drink': [
                {
                    'name': 'Fresh Lime Soda', 
                    'price': 60.00, 
                    'description': 'Refreshing sweet and salty citrus cooler with sparkling soda.', 
                    'image': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=80'
                },
                {
                    'name': 'Mango Lassi', 
                    'price': 90.00, 
                    'description': 'Thick, sweet yogurt-based mango shake blended with fresh pulp.', 
                    'image': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'
                },
                {
                    'name': 'Cold Coffee with Ice Cream', 
                    'price': 120.00, 
                    'description': 'Rich blended iced coffee topped with a thick scoop of vanilla ice cream.', 
                    'image': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&q=80'
                },
                {
                    'name': 'Virgin Mojito', 
                    'price': 110.00, 
                    'description': 'Muddled fresh mint leaves, lime juice, sugar, and sparkling club soda.', 
                    'image': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80'
                },
                {
                    'name': 'Rose Milk', 
                    'price': 70.00, 
                    'description': 'Chilled sweet milk infused with fragrant rose syrup and crushed pistachios.', 
                    'image': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600&q=80'
                },
                {
                    'name': 'Sweet Punjabi Lassi', 
                    'price': 80.00, 
                    'description': 'Traditional thick, churned sweet yogurt drink topped with a dollop of malai.', 
                    'image': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80'
                },
                {
                    'name': 'Blue Lagoon Mocktail', 
                    'price': 130.00, 
                    'description': 'Vibrant blue citrus beverage with sprite and a splash of lemon juice.', 
                    'image': 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&q=80'
                },
                {
                    'name': 'Masala Chaas', 
                    'price': 50.00, 
                    'description': 'Traditional spiced buttermilk infused with roasted cumin and fresh coriander.', 
                    'image': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80'
                },
                {
                    'name': 'KitKat Chocolate Shake', 
                    'price': 150.00, 
                    'description': 'Decadent chocolate milkshake blended with crispy KitKat wafer bars.', 
                    'image': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80'
                },
                {
                    'name': 'Watermelon Cooler', 
                    'price': 100.00, 
                    'description': 'Pure extracted fresh watermelon juice served ice-cold with a hint of mint.', 
                    'image': 'https://images.unsplash.com/photo-1588435153233-a6b4b455bda6?w=600&q=80'
                },
            ]
        }

        for cat_name, items in menu_data.items():
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                print(f"Created category: {cat_name}")
            
            for item_data in items:
                item, item_created = MenuItem.objects.get_or_create(
                    name=item_data['name'],
                    defaults={
                        'category': category,
                        'price': item_data['price'],
                        'description': item_data['description'],
                        'image': item_data['image'],
                        'is_available': True
                    }
                )
                if item_created:
                    print(f"  -> Added item: {item.name} under {cat_name}")

        print("Successfully seeded 10 items for each category with high-res images!")