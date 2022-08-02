<?php
/**
 * Plugin Name:       Chopkins Latest Posts
 * Description:       Chopkins Latest Posts
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       chopkins-latest-posts
 *
 * @package           chopkins-latest-posts
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function chopkins_render_latest_posts_block( $attributes ) {
	$args = array(
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status' => 'publish',
		'order' => $attributes['order'],
		'orderby' => $attributes['orderBy']
	);
	if( $attributes['taxonomy'] && $attributes['term'] ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => $attributes['taxonomy'],
				'field' => 'term_id',
				'terms' => array($attributes['term'])
			)
		);
	}
	$recent_posts = get_posts($args);
	ob_start(); 
	?>
		<ul <?= get_block_wrapper_attributes(); ?>>
			<?php foreach( $recent_posts as $post ) : ?>
				<?php 
					$title = get_the_title($post);
					$permalink = get_permalink($post);
					$excerpt = get_the_excerpt($post);
					$date = esc_html(get_the_date('', $post)); // Date Format wp option
					$datetime = esc_attr(get_the_date('c', $post)); // iso format
					
				?>
				<li class="post">
					<!-- Featured Image -->
					<?php 
						if( $attributes['displayFeaturedImage'] && has_post_thumbnail($post) ) { 
							echo get_the_post_thumbnail($post); 
						} 
					?>
					<!-- Title -->
					<a href="<?= esc_url($permalink); ?>">
						<h3><?= $title; ?></h3>
					</a>
					<!-- Date -->
					<time datetime="<?= $datetime; ?>"><?= $date; ?></time>
					<!-- Excerpt -->
					<?php if( !empty( $excerpt ) ) { echo $excerpt; } ?>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php 
	$posts = ob_get_clean();
	return $posts;
}
function chopkins_latest_posts_chopkins_latest_posts_block_init() {
	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'chopkins_render_latest_posts_block'
	) );
}
add_action( 'init', 'chopkins_latest_posts_chopkins_latest_posts_block_init' );
