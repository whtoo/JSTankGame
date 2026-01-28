#!/usr/bin/env python3
"""
Tank Brigade Tile Analyzer
分析tankbrigade.png图集，提取瓦片信息，生成配置文件
"""

import json
from PIL import Image
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class TileAnalyzer:
    """分析瓦片图集"""
    
    def __init__(self, image_path: str, tile_width: int = 33, tile_height: int = 33):
        self.image_path = Path(image_path)
        self.tile_width = tile_width
        self.tile_height = tile_height
        self.image = None
        self.cols = 0
        self.rows = 0
        
    def load(self) -> bool:
        """加载图集图片"""
        try:
            self.image = Image.open(self.image_path)
            width, height = self.image.size
            self.cols = width // self.tile_width
            self.rows = height // self.tile_height
            print(f"加载图集: {self.image_path}")
            print(f"  尺寸: {width}x{height}")
            print(f"  瓦片: {self.tile_width}x{self.tile_height}")
            print(f"  网格: {self.cols}列 x {self.rows}行")
            print(f"  总数: {self.cols * self.rows}")
            return True
        except Exception as e:
            print(f"加载失败: {e}")
            return False
    
    def get_tile_position(self, tile_id: int) -> Dict:
        """获取瓦片像素坐标"""
        row = tile_id // self.cols
        col = tile_id % self.cols
        return {
            'id': tile_id,
            'row': row,
            'col': col,
            'x': col * self.tile_width,
            'y': row * self.tile_height,
            'width': self.tile_width,
            'height': self.tile_height
        }
    
    def extract_tile(self, tile_id: int) -> Optional[Image.Image]:
        """提取单个瓦片"""
        if not self.image:
            return None
        pos = self.get_tile_position(tile_id)
        box = (pos['x'], pos['y'], pos['x'] + pos['width'], pos['y'] + pos['height'])
        return self.image.crop(box)
    
    def analyze_tile_colors(self, tile_id: int) -> Dict:
        """分析瓦片颜色特征"""
        tile = self.extract_tile(tile_id)
        if not tile:
            return {}
        
        # 转换为RGB分析
        if tile.mode != 'RGB':
            tile = tile.convert('RGB')
        
        pixels = list(tile.getdata())
        total_pixels = len(pixels)
        
        # 计算主要颜色
        color_counts = {}
        for pixel in pixels:
            # 量化颜色
            quantized = (pixel[0] // 32 * 32, pixel[1] // 32 * 32, pixel[2] // 32 * 32)
            color_counts[quantized] = color_counts.get(quantized, 0) + 1
        
        # 排序获取主要颜色
        sorted_colors = sorted(color_counts.items(), key=lambda x: x[1], reverse=True)
        dominant_colors = sorted_colors[:3]
        
        # 检测黑色背景比例
        black_pixels = sum(1 for p in pixels if p[0] < 32 and p[1] < 32 and p[2] < 32)
        black_ratio = black_pixels / total_pixels
        
        return {
            'dominant_colors': dominant_colors,
            'black_ratio': black_ratio,
            'total_pixels': total_pixels
        }
    
    def detect_tile_type(self, tile_id: int) -> str:
        """检测瓦片类型"""
        analysis = self.analyze_tile_colors(tile_id)
        
        if not analysis:
            return 'unknown'
        
        black_ratio = analysis.get('black_ratio', 0)
        dominant = analysis.get('dominant_colors', [])
        
        # 空瓦片检测（大部分是黑色）
        if black_ratio > 0.9:
            return 'empty'
        
        if not dominant:
            return 'unknown'
        
        main_color = dominant[0][0]
        r, g, b = main_color
        
        # 基于主要颜色判断类型
        if r > 150 and g < 100 and b < 100:
            return 'wall_brick'  # 红色砖墙
        elif r > 150 and g > 150 and b > 150:
            return 'concrete'  # 白色/灰色混凝土
        elif g > 100 and r < 150 and b < 100:
            return 'grass'  # 绿色草地
        elif b > 100 and r < 100 and g < 100:
            return 'water'  # 蓝色水域
        elif g > 80 and r > 80 and b < 80:
            return 'forest'  # 黄绿色森林/迷彩
        elif r > 120 and g > 80 and b < 50:
            return 'wood'  # 棕色木头
        elif black_ratio > 0.3:
            return 'mixed'  # 混合地形
        else:
            return 'terrain_other'
    
    def get_tank_frames(self, tank_type: str = 'green') -> Dict[str, List[int]]:
        """获取坦克动画帧ID"""
        if tank_type == 'green':
            # 绿色坦克在第0-5行，第18-23列
            frames = {
                'up': [18, 42],
                'up_right': [19, 43],
                'right': [66, 90],
                'down_right': [91, 115],
                'down': [114, 138],
                'down_left': [139, 163],
                'left': [162, 186],
                'up_left': [187, 211]
            }
        elif tank_type == 'blue':
            # 蓝色坦克在第6-11行，第18-23列
            frames = {
                'up': [162, 186],
                'up_right': [163, 187],
                'right': [210, 234],
                'down_right': [235, 259],
                'down': [258, 282],
                'down_left': [283, 307],
                'left': [306, 330],
                'up_left': [331, 355]
            }
        elif tank_type == 'white':
            # 白色坦克在第8-11行，第12-17列
            frames = {
                'up': [204, 228],
                'up_right': [205, 229],
                'right': [252, 276],
                'down_right': [277, 301],
                'down': [300, 324],
                'down_left': [325, 349],
                'left': [348, 372],
                'up_left': [373, 397]
            }
        else:
            frames = {}
        
        return frames
    
    def export_tiles(self, output_dir: str, tile_ids: Optional[List[int]] = None):
        """导出瓦片图片"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        if tile_ids is None:
            # 导出所有瓦片
            tile_ids = range(self.cols * self.rows)
        
        exported = []
        for tile_id in tile_ids:
            tile = self.extract_tile(tile_id)
            if tile:
                filename = f"tile_{tile_id:03d}.png"
                tile.save(output_path / filename)
                exported.append(tile_id)
        
        print(f"导出 {len(exported)} 个瓦片到 {output_path}")
        return exported
    
    def generate_tileset_config(self) -> Dict:
        """生成完整的tileset配置"""
        tiles = []
        
        # 预定义的关键瓦片
        key_tiles = {
            0: {'type': 'empty', 'name': 'Empty Space', 'passable': True},
            16: {'type': 'empty_variant', 'name': 'Empty Variant', 'passable': True},
            17: {'type': 'wall', 'name': 'Brick Wall', 'passable': False, 'destructible': True, 'hitPoints': 4},
            54: {'type': 'base_eagle', 'name': 'Eagle Base', 'passable': False, 'destructible': True, 'critical': True},
            55: {'type': 'wall_side', 'name': 'Wall Side', 'passable': False, 'destructible': True, 'hitPoints': 3},
            59: {'type': 'concrete', 'name': 'Concrete Block', 'passable': False, 'destructible': False, 'hitPoints': 999},
            60: {'type': 'concrete_variant', 'name': 'Concrete Variant', 'passable': False, 'destructible': False},
            74: {'type': 'terrain_mixed', 'name': 'Mixed Terrain', 'passable': True},
            78: {'type': 'wall_concrete', 'name': 'Concrete Wall', 'passable': False, 'destructible': False},
            99: {'type': 'grass', 'name': 'Grass Terrain', 'passable': True, 'providesCover': True},
            100: {'type': 'wall_brick', 'name': 'Damaged Brick Wall', 'passable': False, 'destructible': True, 'hitPoints': 2},
            102: {'type': 'wall_brick_solid', 'name': 'Solid Brick Wall', 'passable': False, 'destructible': True, 'hitPoints': 3},
            139: {'type': 'water', 'name': 'Water', 'passable': False},
        }
        
        # 草地变体 (314-324)
        for i, tid in enumerate(range(314, 325)):
            key_tiles[tid] = {
                'type': 'grass_variant',
                'name': f'Grass Variant {i+1}',
                'passable': True,
                'providesCover': True
            }
        
        # 生成瓦片配置
        for tile_id, config in key_tiles.items():
            pos = self.get_tile_position(tile_id)
            tile_config = {
                'id': tile_id,
                'type': config['type'],
                'properties': {
                    'name': config['name'],
                    'passable': config.get('passable', True),
                    'destructible': config.get('destructible', False),
                    'pixelX': pos['x'],
                    'pixelY': pos['y']
                }
            }
            
            if 'hitPoints' in config:
                tile_config['properties']['hitPoints'] = config['hitPoints']
            if 'providesCover' in config:
                tile_config['properties']['providesCover'] = config['providesCover']
            if 'critical' in config:
                tile_config['properties']['critical'] = config['critical']
            
            tiles.append(tile_config)
        
        # 坦克精灵定义
        tank_sprites = {
            'green': {
                'description': 'Green tank animations',
                'frames': self.get_tank_frames('green'),
            },
            'blue': {
                'description': 'Blue tank animations',
                'frames': self.get_tank_frames('blue'),
            },
            'white': {
                'description': 'White tank animations',
                'frames': self.get_tank_frames('white'),
            }
        }
        
        # 障碍和地形分类
        obstacles = {
            'impassable': [17, 54, 55, 59, 60, 78, 100, 102, 139],
            'destructible': [17, 54, 55, 100, 102],
            'indestructible': [59, 60, 78, 139]
        }
        
        terrain = {
            'passable': [0, 16, 74, 99] + list(range(314, 325)),
            'cover': [99] + list(range(314, 325))
        }
        
        return {
            'version': '1.1',
            'name': 'Tank Brigade Complete Tileset',
            'type': 'tileset',
            'tilewidth': self.tile_width,
            'tileheight': self.tile_height,
            'columns': self.cols,
            'tilecount': self.cols * self.rows,
            'image': {
                'source': 'tankbrigade.png',
                'width': self.image.width if self.image else 800,
                'height': self.image.height if self.image else 600
            },
            'tiles': tiles,
            'tank_sprites': tank_sprites,
            'obstacles': obstacles,
            'terrain': terrain
        }


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Tank Brigade Tile Analyzer')
    parser.add_argument('--image', '-i', default='resources/tankbrigade.png', help='Input image path')
    parser.add_argument('--export', '-e', help='Export tiles to directory')
    parser.add_argument('--analyze', '-a', type=int, nargs='+', help='Analyze specific tile IDs')
    parser.add_argument('--config', '-c', action='store_true', help='Generate tileset config')
    parser.add_argument('--output', '-o', help='Output config file')
    
    args = parser.parse_args()
    
    analyzer = TileAnalyzer(args.image)
    if not analyzer.load():
        return 1
    
    if args.analyze:
        print("\n=== 瓦片分析 ===")
        for tile_id in args.analyze:
            pos = analyzer.get_tile_position(tile_id)
            tile_type = analyzer.detect_tile_type(tile_id)
            colors = analyzer.analyze_tile_colors(tile_id)
            print(f"\n瓦片 {tile_id}:")
            print(f"  位置: ({pos['x']}, {pos['y']})")
            print(f"  类型: {tile_type}")
            print(f"  黑色比例: {colors.get('black_ratio', 0):.2%}")
            print(f"  主要颜色: {colors.get('dominant_colors', [])[:2]}")
    
    if args.export:
        analyzer.export_tiles(args.export)
    
    if args.config:
        config = analyzer.generate_tileset_config()
        output_file = args.output or 'tileset_generated.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print(f"\n配置已生成: {output_file}")
    
    return 0


if __name__ == '__main__':
    exit(main())
