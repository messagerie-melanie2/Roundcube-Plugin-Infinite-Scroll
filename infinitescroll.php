<?php
/**
 * Roundcube-Plugin-Infinite-Scroll
 *
 * Remove nav page for messages and support infinite scroll instead
 *
 * @author Thomas Payen
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

class infinitescroll extends rcube_plugin {

  /**
   * Task
   * @var string
   */
  public $task = 'mail';

  /**
   * Infinite scroll plugin initialization
   *
   * @see rcube_plugin::init()
   */
  public function init() {
    // Command
    $this->register_action('plugin.set_current_page', array($this,'set_current_page'));

    // Load javascript
    $this->include_script('infinitescroll.js');

    // Use infinite scroll ?
    $this->rc->output->set_env('use_infinite_scroll', $this->rc->config->get('use_infinite_scroll', true));

    // Config hooks
    $this->add_hook('preferences_list', array($this,'prefs_list'));
    $this->add_hook('preferences_save', array($this,'prefs_save'));
  }

  /**
   * Reinit current page
   */
  public function set_current_page() {
    $_SESSION['page'] = 1;
    $result = array('action' => 'plugin.set_current_page');
    echo json_encode($result);
    exit();
  }

  /**
   * Handler for user preferences form (preferences_list hook)
   */
  public function prefs_list($args) {
    if ($args['section'] != 'mailbox') {
      return $args;
    }

    // Load localization and configuration
    $this->add_texts('localization/');

    // Check that configuration is not disabled
    $dont_override = ( array ) $this->rc->config->get('dont_override', array());

    $key = 'melanie2_use_infinite_scroll';
    if (! in_array($key, $dont_override)) {
      $config_key = 'use_infinite_scroll';
      $field_id = "_" . $key;
      $is_checked = $this->rc->config->get($config_key, true);
      $input = new html_checkbox(array('name' => $field_id,'id' => $field_id,'value' => 1));
      $content = $input->show($is_checked);

      $args['blocks']['main']['options'][$key] = array('title' => html::label($field_id, rcube::Q($this->gettext($key))),'content' => $content);
    }
    return $args;
  }

  /**
   * Handler for user preferences save (preferences_save hook)
   */
  public function prefs_save($args) {
    if ($args['section'] != 'mailbox') {
      return $args;
    }

    // Check that configuration is not disabled
    $dont_override = ( array ) $this->rc->config->get('dont_override', array());

    $key = 'melanie2_use_infinite_scroll';
    if (! in_array($key, $dont_override)) {
      $config_key = 'use_infinite_scroll';
      $args['prefs'][$config_key] = rcube_utils::get_input_value('_' . $key, rcube_utils::INPUT_POST) ? true : false;
    }
    return $args;
  }
}