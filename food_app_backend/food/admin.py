from django.contrib import admin
from .models import Category, MenuItem, Order, OrderItem

class CategoryAdmin(admin.ModelAdmin):
    # Removed the missing 'is_active'
    list_display = ('id', 'name') 

class MenuItemAdmin(admin.ModelAdmin):
    # Replaced 'is_veg' with the 'is_available' field we just added to the database
    list_display = ('id', 'name', 'category', 'price', 'is_available') 
    list_filter = ('category', 'is_available')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    # Added the special_instructions field so the kitchen can see them!
    list_display = ('id', 'customer', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    readonly_fields = ('special_instructions',) 
    inlines = [OrderItemInline]

admin.site.register(Category, CategoryAdmin)
admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Order, OrderAdmin)