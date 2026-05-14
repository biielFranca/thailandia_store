-- Limpa todos os produtos seedados (dados ficticios) para que o admin possa
-- cadastrar o catalogo real via /admin/produtos. Mantem as categorias, pois
-- elas refletem a estrutura real do negocio.
--
-- Nao usa ON CONFLICT porque queremos garantir que tudo seja removido.
-- product_images, order_items e order_status_history tem cascades adequados
-- ou ja estavam vazios (apenas pedidos de teste, se houver).

-- 1. Imagens vinculadas
delete from public.product_images
where product_id in (
  select id from public.products
  where store_id = '24d7ba71-21c3-4d19-901a-dcef43aacd89'::uuid
);

-- 2. Produtos
delete from public.products
where store_id = '24d7ba71-21c3-4d19-901a-dcef43aacd89'::uuid;
