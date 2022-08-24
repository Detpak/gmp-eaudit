<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('criteria_group_params', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->constrained('criteria_groups');
            $table->foreignId('criteria_id')->nullable()->constrained('criterias');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('criteria_group_params');
    }
};
