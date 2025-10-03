-- Удаляем тестовые данные
DELETE FROM exercises WHERE lesson_id IN (SELECT id FROM lessons WHERE title IN (
    'Основы гитары', 'Основы пианино', 'Простые аккорды', 'Гаммы на пианино'
));

DELETE FROM lessons WHERE title IN (
    'Основы гитары', 'Основы пианино', 'Простые аккорды', 'Гаммы на пианино'
);
