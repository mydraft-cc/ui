import { Button }       from './button';
import { ButtonBar }    from './button-bar';
import { Checkbox }     from './checkbox';
import { ComboBox }     from './combo-box';
import { Comment }      from './comment';
import { Dropdown }     from './dropdown';
import { Icon }         from './icon';
import { Image }        from './image';
import { Label }        from './label';
import { Link }         from './link';
import { Numeric }      from './numeric';
import { Paragraph }    from './paragraph';
import { Progress }     from './progress';
import { RadioButton }  from './radio-button';
import { Raster }       from './raster';
import { Shape }        from './shape';
import { Slider }       from './slider';
import { TextArea }     from './text-area';
import { TextInput }    from './text-input';
import { Toggle }       from './toggle';

import { RendererService } from '@app/wireframes/model/renderer.service';

export function registerRenderers(): RendererService {
    return new RendererService()
        .addRenderer(new Button())
        .addRenderer(new ButtonBar())
        .addRenderer(new Checkbox())
        .addRenderer(new ComboBox())
        .addRenderer(new Comment())
        .addRenderer(new Dropdown())
        .addRenderer(new Label())
        .addRenderer(new Icon())
        .addRenderer(new Image())
        .addRenderer(new Link())
        .addRenderer(new Numeric())
        .addRenderer(new Paragraph())
        .addRenderer(new Progress())
        .addRenderer(new RadioButton())
        .addRenderer(new Raster())
        .addRenderer(new Shape())
        .addRenderer(new Slider())
        .addRenderer(new TextArea())
        .addRenderer(new TextInput())
        .addRenderer(new Toggle());
}